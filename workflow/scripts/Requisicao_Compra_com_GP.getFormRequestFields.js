function getFormRequestFields(){
	var numProces = getValue("WKNumProces");
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] INIT");

	var codMoeda = hAPI.getCardValue("moeda");
	//USD
	//Obs: mudar o codMoeda de acordo com o ambiente. Linha 10 e 117.
	//Ahora homologação = 16.
	if (codMoeda == "" || codMoeda == null || codMoeda == "undefined"){
		codMoeda = "16";
		log.info("[Requisicao Compra] [getFormRequestFields] [codMoeda vazio, forçando valor default]");
	}
	log.info("[Requisicao Compra] [getFormRequestFields] [codMoeda: " + codMoeda + "]");	
	var cMoeda1 = DatasetFactory.createConstraint("id", codMoeda, codMoeda, ConstraintType.MUST);
	var cMoeda = new Array(cMoeda1);

	var dtMoeda = DatasetFactory.getDataset("dsMoedasAtivas", null, cMoeda, null);
	var moeda = dtMoeda.getValue(0, "codigo");
	log.info("[Requisicao Compra] [getFormRequestFields] [moeda: " + moeda + "]");	
	
	//campos para SAP
	var centroCusto = "";
	var tipoCompra = hAPI.getCardValue("tipoCompra");
	log.info("[Requisicao Compra] [getFormRequestFields] [tipoCompra: " + tipoCompra + "]");	
	var matriculaUser = hAPI.getCardValue("usuarioFluig");
	log.info("[Requisicao Compra] [getFormRequestFields] [matriculaUser: " + matriculaUser + "]");	
	var acc = hAPI.getCardValue("accSolicitante");
	var arrayCodPlanta = "";
	var arrayCodMaterial = "";
	var arrayQuantidade = "";
	var arrayPreco = "";
	var arrayGrupoMaterial = "";
	var arrayDataRemessa = "";
	var arrayObsMaterial = "";
	var arrayGrupoAprovador = "";
	var arrayNomeAprovador = "";
	var arrayAprovador = "";
	var arrayOptAprovar = "";

	var acaoRequisicao = hAPI.getCardValue("acaoRequisicao");
	var centroCusto = hAPI.getCardValue("codCentroCusto");
	var numReqCompra = hAPI.getCardValue("requisicaoSAP");
	var textoObservacao = hAPI.getCardValue("obsRC");
	var catClassifContabil = hAPI.getCardValue("ahoraTipoDespesa");
	var tipoDespesa = hAPI.getCardValue("tipoDespesa");
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] Tipo da despesa: " + tipoDespesa);
	
	var numOrdemInterna = "";
	if(tipoDespesa == "F"){
		numOrdemInterna = hAPI.getCardValue("codOrdemInterna");
	}else if(tipoDespesa == "Z"){
		numOrdemInterna = hAPI.getCardValue("codigoServico");
	}
	
	var c1 = DatasetFactory.createConstraint("code_acc", acc, acc, ConstraintType.MUST);
	var dsIntegracao = DatasetFactory.getDataset("Atento_SAP_Dados_Integracao", null, [c1], null);
	var codSAPSolicitacao = (dsIntegracao != null && dsIntegracao.rowsCount > 0) ? dsIntegracao.getValue(0, "SAPConnectionId") : null;
	
	var sapBrasil = new Array("CC01", "CC02", "CC03");
	var isBrasil = (new java.util.Arrays.asList(sapBrasil).indexOf(acc) != -1) ? true : false;
	
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] Acc: " + acc);
	
	var tipoPedido = (!isBrasil) ? "ZAT" : "NB";
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] Tipo do Pedido: " + tipoPedido);
	
	var deleteInd = "";
	var numRequisicao = hAPI.getCardValue("numRequisicao");
	var codFornecedor = hAPI.getCardValue("codigoFornecedor");	
	var grupoMaterialAprovado = hAPI.getCardValue("grupoMaterialAprovado");
	var changedType = hAPI.getCardValue("changedType");
	
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] acaoRequisicao: " + acaoRequisicao);
	
	var codigoDocVendas = "";
	var codigoCliente = "";
	var siteOperacao = "";
	var produtoPrincipal = "";
	var centroLucro = "";

	if(isBrasil){
		
		if(tipoDespesa == "Z"){
			// Campos exclusivos do Opex a servicos e Pais Brasil
			codigoDocVendas = hAPI.getCardValue("codigoDocVendas");
			codigoCliente = hAPI.getCardValue("codigoCliente");
			siteOperacao = hAPI.getCardValue("siteOperacao");
			produtoPrincipal = hAPI.getCardValue("produtoPrincipal");
			centroLucro = hAPI.getCardValue("centroLucro");
			centroCusto = "";
		}
		
		catClassifContabil = hAPI.getCardValue("tipoDespesa");
	}

	// Moeda
	var codMoeda = hAPI.getCardValue("moeda");
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] codMoeda: " + codMoeda);
	var cMoeda1 = DatasetFactory.createConstraint("id", codMoeda, codMoeda, ConstraintType.MUST);
	var cMoeda = new Array(cMoeda1);
	var dtMoeda = DatasetFactory.getDataset("dsMoedasAtivas", null, cMoeda, null);
	log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] dtMoeda.rowsCount: " + dtMoeda.rowsCount);
	var moeda = dtMoeda.getValue(0, "codigo");
	
	// Forçando o codigo da moeda
	if(moeda==57) moeda=16;
	
	// Itens
   	var arrayIndexItens = getIndexItens(numProces);
	for ( var j = 0; j < arrayIndexItens.length; j++) {
		
		var idx = arrayIndexItens[j];
		
		if(j == 0){
	        arrayCodPlanta = hAPI.getCardValue("cdPlanta___" + idx);
			arrayCodMaterial = hAPI.getCardValue("cdMaterial___" + idx);
			arrayGrupoMaterial = hAPI.getCardValue("grupoMaterial___" + idx);
			arrayQuantidade = hAPI.getCardValue("quantidade___" + idx).trim();
			arrayPreco = tratarPrecoSAP(hAPI.getCardValue("preco___" + idx).trim());
			arrayDataRemessa = tratarDataSAP(hAPI.getCardValue("dtRemessa___" + idx).trim()); 
			arrayObsMaterial = hAPI.getCardValue("observacaoMaterial___" + idx).replace(";",","); 
		}else{
			arrayCodPlanta+= ";" + hAPI.getCardValue("cdPlanta___" + idx);
			arrayCodMaterial+= ";" + hAPI.getCardValue("cdMaterial___" + idx);
			arrayGrupoMaterial+= ";" + hAPI.getCardValue("grupoMaterial___" + idx);
			arrayQuantidade+= ";" + hAPI.getCardValue("quantidade___" + idx);
			arrayPreco+= ";" + tratarPrecoSAP(hAPI.getCardValue("preco___" + idx).trim());
			arrayDataRemessa+= ";" + tratarDataSAP(hAPI.getCardValue("dtRemessa___" + idx).trim());
			arrayObsMaterial+= ";" + hAPI.getCardValue("observacaoMaterial___" + idx).replace(";",",");
		}				
	}
	
   var totalFilhos = arrayIndexItens.length;
   
   log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] totalFilhos: " + totalFilhos);
   
   // Aprovadores
   var arrayIndexAprov = getIndexAprovadores(numProces);
   for ( var i = 0; i < arrayIndexAprov.length; i++) {
	   var idxAprov = arrayIndexAprov[i];
	   
	   if(i == 0){
		   arrayGrupoAprovador = hAPI.getCardValue("grupoAprovador___" + idxAprov);
		   arrayNomeAprovador = hAPI.getCardValue("nomeAprovador___" + idxAprov);
		   arrayAprovador = hAPI.getCardValue("aprovador___" + idxAprov);
		   arrayOptAprovar = hAPI.getCardValue("optAProvar___" + idxAprov);   
	   } else {
		   arrayGrupoAprovador += ";" + hAPI.getCardValue("grupoAprovador___" + idxAprov);
		   arrayNomeAprovador += ";" + hAPI.getCardValue("nomeAprovador___" + idxAprov);
		   arrayAprovador += ";" + hAPI.getCardValue("aprovador___" + idxAprov);
		   arrayOptAprovar += ";" + hAPI.getCardValue("optAProvar___" + idxAprov);  
	   }
   }
   
   var totalAprovadores = arrayIndexAprov.length;
   
   var mapFields = {};
   mapFields.acaoRequisicao = acaoRequisicao;
   mapFields.totalFilhos = totalFilhos;
   mapFields.numRequisicao = numRequisicao;
   mapFields.numReqCompra = numReqCompra;
   mapFields.centroCusto = centroCusto;
   mapFields.tipoCompra = tipoCompra;
   mapFields.matriculaUser = matriculaUser;
   mapFields.numProcess = numProces;
   mapFields.arrayCodPlanta = arrayCodPlanta;
   mapFields.arrayCodMaterial = arrayCodMaterial;
   mapFields.arrayGrupoMaterial = arrayGrupoMaterial;
   mapFields.arrayQuantidade = arrayQuantidade;
   mapFields.arrayPreco = arrayPreco;
   mapFields.arrayDataRemessa = arrayDataRemessa;
   mapFields.moeda = moeda;
   mapFields.textoObservacao = textoObservacao;
   mapFields.numOrdemInterna = numOrdemInterna;
   mapFields.tipoPedido = tipoPedido;   
   mapFields.catClassifContabil = catClassifContabil;
   mapFields.deleteInd = deleteInd;
   mapFields.codFornecedor = codFornecedor;
   mapFields.arrayObsMaterial = arrayObsMaterial;
   mapFields.tipoDespesa = tipoDespesa;
   mapFields.totalAprovadores = totalAprovadores;
   mapFields.arrayGrupoAprovador = arrayGrupoAprovador;
   mapFields.arrayNomeAprovador = arrayNomeAprovador;
   mapFields.arrayAprovador = arrayAprovador;
   mapFields.arrayOptAprovar = arrayOptAprovar;
   mapFields.grupoMaterialAprovado = grupoMaterialAprovado;
   mapFields.changedType = changedType;
   mapFields.codigoDocVendas = codigoDocVendas;
   mapFields.codigoCliente = codigoCliente;
   mapFields.siteOperacao = siteOperacao;
   mapFields.produtoPrincipal = produtoPrincipal;
   mapFields.centroLucro = centroLucro;
   mapFields.codSAPSolicitacao = codSAPSolicitacao;
   mapFields.acc = acc;
   //mapFields.sapGlobal = sapGlobal;
   //mapFields.sapBrasil = sapBrasil;
   log.info("[Requisicao Compra] [getFormRequestFields] [numProcess: " + numProces + "] FINAL");
   
   return mapFields;
}

function getIndexItens(processo){
	var hpForm = hAPI.getCardData(processo);
	
	var keys = hpForm.keySet();
	keys = keys.toString();
	keys.replace("[","");
	keys.replace("]","");

	log.info("[Requisicao Compra] [getFormRequestFields] [getIndexItensRC] [numProcess: " + processo + "] keys: " + keys);
	
	var keyArray = keys.split(",");	
	
	var response = [];
	for ( var k = 0; k < keyArray.length; k++ ){
		
		// Pega somente os index da tabela rc_atento
		if (keyArray[k].indexOf("cdPlanta___") > -1){
			response.push(keyArray[k].trim().split("___")[1]);
		}
		
	}	
	
	return response;
}

function getIndexAprovadores(processo){
	var hpForm = hAPI.getCardData(processo);
	
	var keys = hpForm.keySet();
	keys = keys.toString();
	keys.replace("[","");
	keys.replace("]","");
	
	var keyArray = keys.split(",");	
	
	var response = [];
	for ( var k = 0; k < keyArray.length; k++ ){
		
		// Pega somente os index da tabela rc_aprovadores
		if (keyArray[k].indexOf("aprovador___") > -1){
			response.push(keyArray[k].trim().split("___")[1]);
		}
		
	}	
	
	return response;
}