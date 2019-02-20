function afterStateLeave(sequenceId){
	
	var numProcesso = getValue("WKNumProces");
	log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] INIT");
	
	var mapFields = getFormRequestFields();
	
	var numReqCompra = hAPI.getCardValue("requisicaoSAP");
	var colleagueId = getValue("WKUser");
	var budgetExcedido = "";
	
	var tipoCompra = hAPI.getCardValue("tipoCompra");
	log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] numReqCompra: " + numReqCompra);
	
	var nomeDatasetSap = "";
	var datasetSAP = "";
	
	var atTriarRequisicao = 118;
	if(sequenceId == atTriarRequisicao){
		var temAlteracao = (hAPI.getCardValue("changedType") == "true") ? true : false;
		log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Triar Requisicao. Houve alteracao: " + temAlteracao);
		
		// Buscando os codigos das integracoes na tabela aux "Cadastro de Codigos Integração Fluig x SAP"
		var c1 = DatasetFactory.createConstraint("SAP_ID", mapFields.codSAPSolicitacao, mapFields.codSAPSolicitacao, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("codProcesso", "Requisicao_Compra_com_GP", "Requisicao_Compra_com_GP", ConstraintType.MUST);
		var filtro = new Array(c1, c2);
		var dsCodigosIntegracao = DatasetFactory.getDataset("dsBuscarCodigosIntegracoesSAP", null, filtro, null);

		if(dsCodigosIntegracao == null || dsCodigosIntegracao.rowsCount == 0){
			log.error("Não foi possível identificar o cadastro do processo, verifique se o processo está cadastrado corretamente na tabela auxiliar 'Cadastro de Codigos Integração Fluig x SAP'.");
			throw "Houve um erro de comunicação com o SAP.";
		}

		if (temAlteracao){
			//Desbloquear para poder alterar
			var campos = new Array();
			//var mapFields = getFormRequestFields();
			
			// Codigo para aprovado
			var codigoDesbloqueio = dsCodigosIntegracao.getValue(0, "codAprovado");
			var deleteInd = "";

			var strOptAprovar = mapFields.arrayOptAprovar;
			var arrayOptAprovar = strOptAprovar.split(";");
			
			for ( var k = 0; k < arrayOptAprovar.length; k++ ){
				// Codigo para reprovado
				if (arrayOptAprovar[k] == "nao"){
					codigoDesbloqueio = dsCodigosIntegracao.getValue(0, "codReprovado");					
					break;
				}
			}
			
			campos.push(				// [Indices]
				numReqCompra,			// [00]
				colleagueId,			// [01]
				numProcesso,			// [02]
				codigoDesbloqueio,		// [03]
				mapFields.acc			// [04]
			);
			
			nomeDatasetSap = "Atento_SAP_Desbloquear_RC";
			
			if (tipoCompraSemIntegracao(tipoCompra)) {
				nomeDatasetSap = "Atento_NO_SAP";
			}
			
			datasetSAP = DatasetFactory.getDataset(nomeDatasetSap, campos, null, null);
			
			if(dataset.getValue(0, "ERRO") != null || (dataset.getValue(0, "outputCode") != "200" && dataset.getValue(0, "outputCode") != "200.0")){
				throw(""+i18n.translate("sapIndisponivel"));
			}else if(dataset.getValue(0, "TYPE") == "E"){
				if(!dataset.getValue(0, "CODE").equalsIgnoreCase("W5104")){
					throw("ERRO: "+dataset.getValue(0,"MESSAGE"));
				}
			}

			log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Desbloqueio Realizado");
			
			//Alterar
			var campos = new Array();
			
			campos.push(							// [Indices]
					mapFields.totalFilhos,			// [00]
					numReqCompra,					// [01]
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
					mapFields.catClassifContabil, 	// [14]
					mapFields.tipoPedido,			// [15]
					deleteInd,						// [16]
					mapFields.codFornecedor, 		// [17]
					mapFields.codigoDocVendas,		// [18]
					mapFields.codigoCliente,		// [19]
					mapFields.siteOperacao, 		// [20]			
					mapFields.produtoPrincipal,		// [21]
					mapFields.centroLucro,			// [22]
					mapFields.arrayObsMaterial,		// [23]
					mapFields.acc					// [24]
				);
			
			nomeDatasetSap = "Atento_SAP_Modificar_RC";
			
			if (tipoCompraSemIntegracao(tipoCompra)) {
				nomeDatasetSap = "Atento_NO_SAP";
			}
			
			datasetSAP = DatasetFactory.getDataset(nomeDatasetSap, campos, null, null);
			
			var erroOcorrido = "";
			
			for(var s = 0; s < datasetSAP.rowsCount; s++){
				var type = "";
				if(datasetSAP.getValue(s, "TYPE") != null){
					type = datasetSAP.getValue(s, "TYPE").toUpperCase().trim().toString();
				}
				log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Atualizar TipoCompra - Type: " + type);
					
				if(type == "W"){
					if(datasetSAP.getValue(s, "NUMBER").toString() == "303"){
						log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Atualizar TipoCompra: " + datasetSAP.getValue(s, "MESSAGE"));
					}
				}else if(type == "S"){
					
					log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Atualizar TipoCompra - req: " + datasetSAP.getValue(s, "MESSAGEV1"));

				}else if(type == "E"){
					if(datasetSAP.getValue(s, "MESSAGE") != ""){
						erroOcorrido+="<br />"+datasetSAP.getValue(s, "MESSAGE");
						budgetExcedido = "<erro> - "+datasetSAP.getValue(s, "MESSAGE");
					}else{
						erroOcorrido+="<br />"+datasetSAP.getValue(s, "LOG_NO");
						budgetExcedido = "<erro> - "+datasetSAP.getValue(s, "LOG_NO");
					}
					log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Atualizar TipoCompra Erro: " + budgetExcedido);
					
				}else if(datasetSAP.getValue(s, "ERRO") != null){
					erroOcorrido=i18n.translate("sapIndisponivel");
					budgetExcedido = "<erro> - "+datasetSAP.getValue(s, "ERRO");
					log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Atualizar TipoCompra Erro Criar Requisicao: " + budgetExcedido);

				}else if(datasetSAP.getValue(s, "outputCode") != "200" && datasetSAP.getValue(s, "outputCode") != "200.0"){
					erroOcorrido+="<br />"+datasetSAP.getValue(s, "outputCode")+", "+datasetSAP.getValue(s, "outputMessage");
					budgetExcedido = "<erro> - "+datasetSAP.getValue(s, "outputMessage");
					log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Atualizar TipoCompra Erro Criar Requisicao: " + budgetExcedido);
				}
			}

			if(erroOcorrido != ""){
				throw("ERRO: "+ erroOcorrido);
			}

			log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] ErroOcorrido: " + erroOcorrido);
			log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] budgetExcedido: " + budgetExcedido);
			
		}
	}
	log.info("[Requisicao Compra] [afterStateLeave] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] FINAL");
}

function tipoCompraSemIntegracao(tipoCompra){
	return tipoCompra == "RFI" || tipoCompra == "CATALOGO" || tipoCompra == "PRORROG";
}