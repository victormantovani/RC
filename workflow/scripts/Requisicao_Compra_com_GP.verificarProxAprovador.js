function verificarProxAprovador(){
	
	var numProces = getValue("WKNumProces");
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] INIT");
	
	var valorTotal = hAPI.getCardValue("totalRC");
	valorTotal = tratarPrecoSAP(valorTotal);
	valorTotal = parseFloat(valorTotal.replace(".",",")).toFixed(2);	
	var moeda = hAPI.getCardValue("moeda");	
	var nivelAtual = hAPI.getCardValue("actualLevelAproval");	
	var totalNiveis = hAPI.getCardValue("totalLevelAprovals");	
	var acc = hAPI.getCardValue("accSolicitante");	
	var centroCusto = hAPI.getCardValue("codCentroCusto");	
	var codigoServico = hAPI.getCardValue("codigoServico");	
	var tipoDespesa = hAPI.getCardValue("tipoDespesa");	
	var tipoCompra = hAPI.getCardValue("tipoCompra");	
	var codigoVendas = hAPI.getCardValue("codigoDocVendas");
	var sapBrasil = new Array("CC01", "CC02", "CC03");	
	var isBrasil =  (new java.util.Arrays.asList(sapBrasil).indexOf(acc) != -1) ? true : false;
	
	// Este ID deve ser igual da moeda Dolar cadastrado na tabela auxiliar 
	// localizada em "Raíz / Configurações dos Processos Fluig / Tabelas Auxiliares / Cadastro de Moedas
	// Pois somente sera feita a conversao quando for diferente de Dolar
	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] isBrasil: " + isBrasil);	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Moeda: " + moeda);	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] codigoServico: " + codigoServico);	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] tipoDespesa: " + tipoDespesa);	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] codigoVendas: " + codigoVendas);	

	if(moeda != 30){
		var cMoeda1 = DatasetFactory.createConstraint("id", moeda, moeda, ConstraintType.MUST);
		var cMoeda2 = DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST);
		var cMoeda = new Array(cMoeda1, cMoeda2);
		
		var dtMoeda = DatasetFactory.getDataset("dsMoedasAtivas", null, cMoeda, null);
		var taxaConversao = dtMoeda.getValue(0, "taxaConversao");
		
		valorTotal = parseFloat(valorTotal) / parseFloat(valorFormat(taxaConversao));
		
		var cMoeda2_1 = DatasetFactory.createConstraint("codigo", "USD", "USD", ConstraintType.MUST);
		var cMoeda2_2 = DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST);
		var cMoeda2 = new Array(cMoeda2_1, cMoeda2_2);
		
		var dtMoeda2 = DatasetFactory.getDataset("dsMoedasAtivas", null, cMoeda2, null);
		moeda = dtMoeda2.getValue(0, "id");
		log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Moeda Convertida para USD: " + moeda);
	}
	
	if (!(tipoCompra == "RFI" || tipoCompra == "CATALOGO" || tipoCompra == "PRORROG")) {
		log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] tipoCompra diferente de RFI ou Catálogo ou Prorrogação");
		
		//tratamento para verificar se CECO, COD SERVICO ou DESTINATARIO existem
		if(nivelAtual == ""){

			nivelAtual = 1;
			
			//Lista niveis cadastrados
			var cNivel11 = DatasetFactory.createConstraint("moeda", moeda, moeda, ConstraintType.MUST);
			var cNivel12 = DatasetFactory.createConstraint("tipoDocumento", "requisicao", "requisicao", ConstraintType.MUST);
			var cNivel13 = DatasetFactory.createConstraint("codACC", acc, acc, ConstraintType.MUST);
			var cNivel14 = DatasetFactory.createConstraint("numProcess", numProces, numProces, ConstraintType.MUST);
			
			var cNivel2 = new Array(cNivel11, cNivel12, cNivel13, cNivel14);
			
			var dsNiveis2 = DatasetFactory.getDataset("dsAtentoNivelAprovFiltroData", null, cNivel2, null);
			
			if(dsNiveis2.rowsCount > 0){
				
				var cAprov1 = DatasetFactory.createConstraint("nivel_aprov", nivelAtual, nivelAtual, ConstraintType.MUST);
				var arrAprov = new Array(cAprov1);
				
				var dsAprov;
				
				if(tipoDespesa == "Z"){
					
					if(!isBrasil){
						codigoVendas = "00" + codigoServico.slice(0, 8);
					}

					arrAprov.push(DatasetFactory.createConstraint("codigo_vendas", codigoVendas, codigoVendas, ConstraintType.MUST));
					dsAprov = DatasetFactory.getDataset("atento_aprovadores_codigo_vendas", null, arrAprov, null);
				} else{
					arrAprov.push(DatasetFactory.createConstraint("centro_custo", centroCusto, centroCusto, ConstraintType.MUST));
					dsAprov = DatasetFactory.getDataset("atento_aprovadores_centro_custo", null, arrAprov, null);
				}
				
				if(dsAprov.rowsCount > 0){
					var user = dsAprov.getValue(0, "matricula_aprov");
					var cUser1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", user, user, ConstraintType.MUST);
					var cUser2 = DatasetFactory.createConstraint("active", true, true, ConstraintType.MUST);
					var Users = new Array(cUser1, cUser2);
					
					var dsUser = DatasetFactory.getDataset("colleague", null, Users, null);
					if(dsUser.rowsCount == 0){
						var alerta = i18n.translate("alertaAtividadeEncaminhada");
						alerta+= " " + dsAprov.getValue(0, "nome_aprov") +" ("+user+"), ";
						alerta+= i18n.translate("alertaUsuarioNaoCadastro");
						
						throw(alerta);
					}
				}else{
					var alerta = "";
					if(tipoDespesa == "Z"){
						alerta+= " "+i18n.translate("alertaCodigoServico") + " " + codigoServico;
					}else{
						alerta+= " "+i18n.translate("alertaCentroCusto") + " " + centroCusto;
					}
					alerta+= " "+i18n.translate("alertaSelecinadoNaoCadastrado");
					throw(alerta);
				}
			
			}else{
				var alerta = "";
				if(tipoDespesa == "Z"){
					alerta+= " "+i18n.translate("alertaCodigoServico") + " " + codigoServico;
				}else{
					alerta+= " "+i18n.translate("alertaCentroCusto") + " " + centroCusto;
				}
				alerta+= " "+i18n.translate("alertaSelecinadoNaoCadastrado");
				throw(alerta);
			}
			
			return true;
		}
		
		//verifica o nivel atual e o total que devera percorrer
		if(totalNiveis == ""){
			//Lista niveis cadastrados
			var cNivel1 = DatasetFactory.createConstraint("moeda", moeda, moeda, ConstraintType.MUST);
			var cNivel2 = DatasetFactory.createConstraint("tipoDocumento", "requisicao", "requisicao", ConstraintType.MUST);
			var cNivel3 = DatasetFactory.createConstraint("codACC", acc, acc, ConstraintType.MUST);
			var cNivel4 = DatasetFactory.createConstraint("numProcess", numProces, numProces, ConstraintType.MUST);
			
			var constraints = new Array(cNivel1, cNivel2, cNivel3, cNivel4);
			
			var dsNiveis = DatasetFactory.getDataset("dsAtentoNivelAprovFiltroData", null, constraints, null);
			
			for(var i = 0; i < dsNiveis.rowsCount; i++){
				
				log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Nivel = "+dsNiveis.getValue(i, "nivel")+", De = "+dsNiveis.getValue(i, "valor_de")+", Ate = "+dsNiveis.getValue(i, "valor_ate"));
				
				var nivel = dsNiveis.getValue(i, "nivel");
				var valorInicial = limparValor(dsNiveis.getValue(i, "valor_de"));
				var valorFinal = 0;
				if(dsNiveis.getValue(i, "valor_ate") != ""){
					valorFinal = limparValor(dsNiveis.getValue(i, "valor_ate"));
				}
				
				if((valorTotal >= valorInicial && valorTotal <= valorFinal) || (valorTotal >= valorInicial && dsNiveis.getValue(i, "valor_ate") == "")){
					totalNiveis = nivel;
				}
			}
		}
		
		nivelAtual = parseInt(nivelAtual);
		totalNiveis = parseInt(totalNiveis);
		nivelAtual++;
		
		//tratamento para verificar se nao existem mais niveis ou se esta pulando algum nivel
		for(var nivel = nivelAtual; nivel <= totalNiveis; nivel++){
			var cAprov1 = DatasetFactory.createConstraint("nivel_aprov", nivel, nivel, ConstraintType.MUST);
			var arrAprov = new Array(cAprov1);
			
			var dsAprov;
			
			if(tipoDespesa == "Z"){
				
				if(!isBrasil){
					codigoVendas = "00" + codigoServico.slice(0, 8);
				}
				
				arrAprov.push(DatasetFactory.createConstraint("codigo_vendas", codigoVendas, codigoVendas, ConstraintType.MUST));
				dsAprov = DatasetFactory.getDataset("atento_aprovadores_codigo_vendas", null, arrAprov, null);
			}else{
				arrAprov.push(DatasetFactory.createConstraint("centro_custo", centroCusto, centroCusto, ConstraintType.MUST));
				dsAprov = DatasetFactory.getDataset("atento_aprovadores_centro_custo", null, arrAprov, null);
			}
			
			//se nao encontra aprovador no nivel atual, forca chegar no ultimo nivel
			if(dsAprov.rowsCount == 0){
				if(nivel == totalNiveis){
					nivelAtual = (totalNiveis+1);
				}else{
					nivelAtual++;
				}
			}else{
				break;
			}
		}
	}
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] setCardValue - totalLevelAprovals: " + totalNiveis.toString());
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] setCardValue - actualLevelAproval: " + nivelAtual.toString());
	
	//seta os valores nos campos para a pr?xima verifica??o de posi??o
	hAPI.setCardValue("totalLevelAprovals", totalNiveis.toString());
	hAPI.setCardValue("actualLevelAproval", nivelAtual.toString());
	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Total Nivel: " + totalNiveis.toString());
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Proximo Nivel: " + nivelAtual.toString());
	
	if(nivelAtual <= totalNiveis){
		log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Precisa de mais aprovador");
		return true;
	}
	
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] Foi o ultimo aprovador");
	log.info("[Requisicao Compra] [verificarProxAprovador] [numProcess: " + numProces + "] FINAL");
	return false;
}

function limparValor(valor){
	var valorLimpo = valor;
	valorLimpo = valorLimpo.replace(".","");
	valorLimpo = valorLimpo.replace(",",".");
	valorLimpo = parseFloat(valorLimpo);
	
	return valorLimpo;
}

function valorFormat(valor){
	var totalLeft = valor.length() - 3;
	
	var tresUltimos = Right(valor,3).replace(",",".");
	
	var valorTratado = escapeRegExp(Left(valor,totalLeft))+""+tresUltimos;
	
	return valorTratado;
}

function Right(str, n){
    if (n <= 0)
       return "";
    else if (n > String(str).length)
       return str;
    else {
       var iLen = String(str).length;
       return String(str).substring(iLen, iLen - n);
    }
}

function Left(str, n){
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}

function escapeRegExp(str) {
	return str.replace(/[-.,*+?^${}()|[\]\\]/g, "");
}