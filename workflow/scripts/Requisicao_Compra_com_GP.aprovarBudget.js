function aprovarBudget(){
	var numProces = getValue("WKNumProces");
	
	log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] INIT");
	
	//Trecho encapsulado para ser utilizado em outras funcoes
	var mapFields = getFormRequestFields();
	var campos = new Array();
	var datasetSAP;
	var nomeDatasetSAP;

	var valorTotal = hAPI.getCardValue("totalRC");
	valorTotal = tratarPrecoSAP(valorTotal);
	valorTotal = parseFloat(valorTotal.replace(",",".")).toFixed(2);
	log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] valorTotal: " + valorTotal);
	
	var resultadoBudget = "suficiente";
	
	var enviando = (getValue("WKCompletTask") == "true");

	log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] enviando: " + enviando);

	if(enviando){
		if(hAPI.getCardValue("budgetAprovado") == "false"){
			log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] moeda: " + mapFields.moeda);
			
			if(hAPI.getCardValue("acaoRequisicao") == "criar"){
				campos.push(						// [Indices]
					mapFields.totalFilhos, 			// [00]
					mapFields.centroCusto, 			// [01]
					mapFields.tipoCompra, 			// [02]
					mapFields.matriculaUser, 		// [03]
					mapFields.numProcess, 			// [04]
					mapFields.arrayCodPlanta, 		// [05]
					mapFields.arrayCodMaterial, 	// [06]
					mapFields.arrayQuantidade, 		// [07]
					mapFields.arrayPreco, 			// [08]
					mapFields.arrayDataRemessa, 	// [09]
					mapFields.moeda, 				// [10]
					mapFields.textoObservacao, 		// [11]
					mapFields.numOrdemInterna,		// [12]
					mapFields.catClassifContabil,	// [13]
					mapFields.tipoPedido,			// [14]
					mapFields.codFornecedor, 		// [15]
					mapFields.codigoDocVendas, 		// [16]
					mapFields.codigoCliente,		// [17]			
					mapFields.siteOperacao, 		// [18]
					mapFields.produtoPrincipal, 	// [19]
					mapFields.centroLucro, 			// [20]
					mapFields.arrayObsMaterial,		// [21]
					mapFields.acc					// [22]
				);
				
				nomeDatasetSAP = 'Atento_SAP_Incluir_RC';
				
				if (tipoCompraSemIntegracao(mapFields.tipoCompra)){
					nomeDatasetSAP = 'Atento_NO_SAP';
				}
			}else{		
				campos.push(						// [Indices]
					mapFields.totalFilhos,			// [00]
					mapFields.numRequisicao,		// [01]
					mapFields.centroCusto, 			// [02]
					mapFields.tipoCompra,			// [03]
					mapFields.matriculaUser,		// [04]
					mapFields.numProcess, 			// [05]
					mapFields.arrayCodPlanta,		// [06]
					mapFields.arrayCodMaterial,		// [07]
					mapFields.arrayQuantidade, 		// [08]
					mapFields.arrayPreco,			// [09]
					mapFields.arrayDataRemessa,		// [10]
					mapFields.moeda, 				// [11]
					mapFields.textoObservacao,		// [12]
					mapFields.numOrdemInterna,		// [13]
					mapFields.catClassifContabil,	// [14] 
					mapFields.tipoPedido,			// [15]
					mapFields.deleteInd,			// [16]
					mapFields.codFornecedor, 		// [17]
					mapFields.codigoDocVendas,		// [18]
					mapFields.codigoCliente,		// [19]
					mapFields.siteOperacao, 		// [20]
					mapFields.produtoPrincipal,		// [21]
					mapFields.centroLucro,			// [22]
					mapFields.arrayObsMaterial,		// [23]
					mapFields.acc					// [24]
				);
				
				nomeDatasetSAP ='Atento_SAP_Modificar_RC'; 
				
				if (tipoCompraSemIntegracao(mapFields.tipoCompra)){
					nomeDatasetSAP = 'Atento_NO_SAP';
				}
			}

			datasetSAP = DatasetFactory.getDataset(nomeDatasetSAP, campos, null, null);

			var erroOcorrido = "";
			
			for(var s = 0; s < datasetSAP.rowsCount; s++){
				var type = "";
				if(datasetSAP.getValue(s, "TYPE") != null){
					type = datasetSAP.getValue(s, "TYPE").toUpperCase().trim().toString();
				}
				log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Type: " + type);
					
				if(type == "W"){
					if(datasetSAP.getValue(s, "NUMBER").toString() == "303"){
						resultadoBudget = "excedido";
						log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Budget Excedido: " + datasetSAP.getValue(s, "MESSAGE"));
					}
				}else if(type == "S"){
					//rcCriada = true;
					
					log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Req: " + datasetSAP.getValue(s, "MESSAGEV1"));
					
					if(hAPI.getCardValue("acaoRequisicao") == "criar"){
						hAPI.setCardValue("requisicaoSAP", datasetSAP.getValue(s, "MESSAGEV1")); //pega numero de requisicao criada
						if(hAPI.getCardValue("tipoCompra") != "RFI" && hAPI.getCardValue("tipoCompra") != "PRORROG" && hAPI.getCardValue("tipoCompra") != "CATALOGO") {
							hAPI.setCardValue("identificador", (hAPI.getCardValue("identificador") + " - "+datasetSAP.getValue(s, "MESSAGEV1")));
						}
					}else{
						hAPI.setCardValue("requisicaoSAP", mapFields.numRequisicao);
					}				
					var hoje = new Date();
					hAPI.setCardValue("dataRequisicao", (hoje.getFullYear()+"-"+(hoje.getMonth()+1)+"-"+hoje.getDate()));
					log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Requisicao no SAP criada com sucesso: " + datasetSAP.getValue(s, "MESSAGEV1"));
					
				}else if(type == "E"){
					
					if(datasetSAP.getValue(s, "MESSAGE") != ""){
						erroOcorrido+="<br />"+datasetSAP.getValue(s, "MESSAGE");
						resultadoBudget = "<erro> - "+datasetSAP.getValue(s, "MESSAGE");
					}else{
						erroOcorrido+="<br />"+datasetSAP.getValue(s, "LOG_NO");
						resultadoBudget = "<erro> - "+datasetSAP.getValue(s, "LOG_NO");
					}
					log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Erro ao criar requisicao: " + resultadoBudget);
					
					hAPI.setCardValue("obsRC", hAPI.getCardValue("obsRC") + ". " + resultadoBudget.substring(9));
				}else if(datasetSAP.getValue(s, "ERRO") != null){
					erroOcorrido=i18n.translate("sapIndisponivel");
					resultadoBudget = "<erro> - "+datasetSAP.getValue(s, "ERRO");
					log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Erro ao criar requisicao: " + resultadoBudget);
					hAPI.setCardValue("obsRC", hAPI.getCardValue("obsRC") + ". " + resultadoBudget.substring(9));
				}else if(datasetSAP.getValue(s, "outputCode") != "200" && datasetSAP.getValue(s, "outputCode") != "200.0"){
					erroOcorrido+="<br />"+datasetSAP.getValue(s, "outputCode")+", "+datasetSAP.getValue(s, "outputMessage");
					resultadoBudget = "<erro> - "+datasetSAP.getValue(s, "outputMessage");
					log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Erro ao criar requisicao: " + resultadoBudget);
				}
			}
	
			if(erroOcorrido != ""){
				throw "ERRO: "+ erroOcorrido;
			}
			
			log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] ErroOcorrido: " + erroOcorrido);
		}
	}
	
	log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] Resultado do Budget: " + resultadoBudget);
	log.info("[Requisicao Compra] [aprovarBudget] [numProcess: " + numProces + "] FINAL");
	return resultadoBudget;
}

function tratarDataSAP(data){
	var dia = data.substr(0,2);
	var mes = data.substr(3,2);
	var ano = data.substr(6,4);
	
	return (ano+"-"+mes+"-"+dia);
}

function tratarPrecoSAP(preco){
	var sepDecimal = preco.substr((preco.length() - 3), 1);
	if(sepDecimal == "."){
		return preco.replace(",","").replace(".",",");
	}else{
		return preco.replace(".","");
	}
}

function tipoCompraSemIntegracao(tipoCompra){
	return tipoCompra == "RFI" || tipoCompra == "CATALOGO" || tipoCompra == "PRORROG";
}