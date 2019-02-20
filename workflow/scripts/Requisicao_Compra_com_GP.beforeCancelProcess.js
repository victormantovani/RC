function beforeCancelProcess(colleagueId,processId){
	var numProcesso = getValue("WKNumProces");
	var ativAtual = getValue("WKNumState");
	
	log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] INIT");

	var mapFields = getFormRequestFields();
	
	if(ativAtual == 122){
		throw(""+i18n.translate("alertaImpossivelCancelar"));
	}else{
		log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] Solicitante: " + mapFields.matriculaUser);
		log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] Requisicao: " + mapFields.numReqCompra);
		log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] Cancelada por: " + colleagueId);
		log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] Acc: " + mapFields.acc);
		
		var forceCancel = isForceCancel(processId);
		
		if (forceCancel){
			log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] Cancelamento sem integracao com SAP");
		} else {
			
			if(mapFields.numReqCompra != ""){
				
				var campos = new Array();
				log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + numProcesso + "] codSAPSolicitacao = " + mapFields.codSAPSolicitacao);
				
				// Buscando os codigos das integracoes na tabela aux "Cadastro de Codigos Integração Fluig x SAP"
				var c1 = DatasetFactory.createConstraint("SAP_ID", mapFields.codSAPSolicitacao, mapFields.codSAPSolicitacao, ConstraintType.MUST);
				var c2 = DatasetFactory.createConstraint("codProcesso", "Requisicao_Compra_com_GP", "Requisicao_Compra_com_GP", ConstraintType.MUST);
				var filtro = new Array(c1, c2);
				var dsCodigosIntegracao = DatasetFactory.getDataset("dsBuscarCodigosIntegracoesSAP", null, filtro, null);
				
				if(dsCodigosIntegracao == null || dsCodigosIntegracao.rowsCount == 0){
					log.error("Não foi possível identificar o cadastro do processo, verifique se o processo está cadastrado corretamente na tabela auxiliar 'Cadastro de Codigos Integração Fluig x SAP'.");
					throw "Houve um problema na integração.";
				}

				// Codigo para reprovado
				var codigoDesbloqueio = dsCodigosIntegracao.getValue(0, "codReprovado");
				
				var datasetDesbloqueio = "Atento_SAP_Desbloquear_RC";
				if (tipoCompraSemIntegracao(mapFields.tipoCompra)){
					datasetDesbloqueio = "Atento_NO_SAP";
				}
				
				campos.push(mapFields.numReqCompra, colleagueId, processId, codigoDesbloqueio, mapFields.acc);
				var dataset = DatasetFactory.getDataset(datasetDesbloqueio, campos, null, null);
				
				log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + numProcesso + "] outputCode = " + dataset.getValue(0, "outputCode"));
				log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + numProcesso + "] TYPE = " + dataset.getValue(0, "TYPE"));
				
				if(dataset.getValue(0, "ERRO") != null || (dataset.getValue(0, "outputCode") != "200" && dataset.getValue(0, "outputCode") != "200.0")){
					throw(""+i18n.translate("sapIndisponivel"));
				}else if(dataset.getValue(0, "TYPE") == "E"){
					if(!dataset.getValue(0, "CODE").equalsIgnoreCase("W5104")){
						throw("ERRO: "+dataset.getValue(0,"MESSAGE"));
					}
				}
				
				campos = new Array();
				
				var emailUsuario = "";
				var assuntoEmail = "";
				var conteudoEmail = "";
				
				var deleteInd = "X";

				campos.push(
					mapFields.totalFilhos, mapFields.numReqCompra, mapFields.centroCusto, 
					mapFields.tipoCompra, mapFields.matriculaUser, processId, 
					mapFields.arrayCodPlanta, mapFields.arrayCodMaterial, mapFields.arrayQuantidade,
					mapFields.arrayPreco, mapFields.arrayDataRemessa, mapFields.moeda, 
					mapFields.textoObservacao, mapFields.numOrdemInterna, mapFields.catClassifContabil,
					mapFields.tipoPedido, deleteInd, mapFields.codFornecedor, 
					mapFields.codigoDocVendas, mapFields.codigoCliente, mapFields.siteOperacao, 
					mapFields.produtoPrincipal, mapFields.centroLucro, mapFields.arrayObsMaterial, 
					mapFields.acc);
				
				var datasetModificacao = "Atento_SAP_Modificar_RC";

				if (tipoCompraSemIntegracao(mapFields.tipoCompra)){
					datasetModificacao = "Atento_NO_SAP";
				}
			    
				var dataset = DatasetFactory.getDataset(datasetModificacao, campos, null, null);
				
				if(dataset.getValue(0, "ERRO") != null || (dataset.getValue(0, "outputCode") != "200" && dataset.getValue(0, "outputCode") != "200.0")){
					throw(""+i18n.translate("sapIndisponivel"));
				}else if(dataset.getValue(0, "TYPE") == "E"){
					throw("ERRO: "+dataset.getValue(0,"MESSAGE"));
				}
				
				log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] Requisicao " + mapFields.numReqCompra + " CANCELADA !!!");
				
				if(emailUsuario != ""){
					assuntoEmail=i18n.translate("mail_title");
					
					conteudoEmail+=i18n.translate("mail_mensagemNumeroProcesso")+" "+processId +" ";
					conteudoEmail+=i18n.translate("mail_requisicaoNumero")+": "+mapFields.numReqCompra;
					conteudoEmail+=mail_tratativa+"<br />";
					
					enviarEmail(emailUsuario, assuntoEmail, conteudoEmail);
				}
			}
		}
	}
	
	log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] FINAL");
}

function isForceCancel(processId){
	var result = false;
	
	var c1 = DatasetFactory.createConstraint("numProcess", processId, processId, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	
	var dsCancelProcess = DatasetFactory.getDataset("dsCancelProcessByPassSapIntegration", null, constraints, null);
	
	if (dsCancelProcess != null && dsCancelProcess.rowsCount > 0){
		log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] [ForceCancel] userCode: " + dsCancelProcess.getValue(0, "userCode"));
		log.info("[Requisicao Compra] [beforeCancelProcess] [numProcess: " + processId + "] [ForceCancel] dateTime: " + dsCancelProcess.getValue(0, "dateTime"));
		result = true;
	}
	return result;
}

function tipoCompraSemIntegracao(tipoCompra){
	return tipoCompra == "RFI" || tipoCompra == "CATALOGO" || tipoCompra == "PRORROG";
}