function beforeStateEntry(sequenceId){
	var numProcesso = getValue("WKNumProces");
	log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] INIT");
	
	/* Sempre deixar essas variaveis como globais */
	var atAprovada = 122;
	var atReprovada = 89;
	var emailUsuario = "";
	var assuntoEmail = "";
	var conteudoEmail = "";
	var codigoDesbloqueio = null;
	var mapFields = null;
	var dsCodigosIntegracao = null;

	if(sequenceId == atAprovada || sequenceId == atReprovada){
		mapFields = getFormRequestFields();

		var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", mapFields.matriculaUser, mapFields.matriculaUser, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("active", "true", "true", ConstraintType.MUST);
		var constraints = new Array(c1, c2);
		var dataset = DatasetFactory.getDataset("colleague", null, constraints, null);
		
		if(dataset.rowsCount > 0){
			emailUsuario = dataset.getValue(0, "mail");
			nomeUsuario = dataset.getValue(0, "colleagueName");
		}

		log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Tratamento RC: " + mapFields.numReqCompra);
		
		// Buscando os codigos das integracoes na tabela aux "Cadastro de Codigos Integração Fluig x SAP"
		var c1 = DatasetFactory.createConstraint("SAP_ID", mapFields.codSAPSolicitacao, mapFields.codSAPSolicitacao, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("codProcesso", "Requisicao_Compra_com_GP", "Requisicao_Compra_com_GP", ConstraintType.MUST);
		var filtro = new Array(c1, c2);
		dsCodigosIntegracao = DatasetFactory.getDataset("dsBuscarCodigosIntegracoesSAP", null, filtro, null);
	
		if(dsCodigosIntegracao == null || dsCodigosIntegracao.rowsCount == 0){
			log.error("Não foi possível identificar o cadastro do processo, verifique se o processo está cadastrado corretamente na tabela auxiliar 'Cadastro de Codigos Integração Fluig x SAP'.");
			throw "Houve um problema na integração. Por favor, contate o departamento de TI.";
		}

		// Receber codigo para aprovado
		codigoDesbloqueio = dsCodigosIntegracao.getValue(0, "codAprovado");	
	}
	

	if(sequenceId == atAprovada){
		var campos = new Array();
		
		var datasetDesbloqueio = "Atento_SAP_Desbloquear_RC";
		if (tipoCompraSemIntegracao(mapFields.tipoCompra)) {
			datasetDesbloqueio = "Atento_NO_SAP";
		}
		
		campos.push(mapFields.numReqCompra, mapFields.matriculaUser, numProcesso, codigoDesbloqueio, mapFields.acc);
		
		var dataset = DatasetFactory.getDataset(datasetDesbloqueio, campos, null, null);
		
		if(dataset.getValue(0, "ERRO") != null){
			throw("ERRO: "+dataset.getValue(0,"ERRO"));
		}else if(dataset.getValue(0, "TYPE") == "E" || (dataset.getValue(0, "outputCode") != "200" && dataset.getValue(0, "outputCode") != "200.0")){
			if(dataset.getValue(0, "CODE") != "W5104"){
				throw("ERRO: "+dataset.getValue(0,"MESSAGE"));
			}
		}
		
		log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Requisicao " + mapFields.numReqCompra + " APROVADA COM SUCESSO !!!");
		
		if(emailUsuario != ""){
			assuntoEmail=i18n.translate("mail_title");
			
			conteudoEmail+=i18n.translate("mail_mensagemNumeroProcesso")+" "+numProcesso +" ";
			conteudoEmail+=i18n.translate("mail_requisicaoNumero")+": "+mapFields.numReqCompra;
			conteudoEmail+=i18n.translate("mail_aprovada")+"<br />";
			
			enviarEmail(emailUsuario, assuntoEmail, conteudoEmail);
		}
		
	}else if(sequenceId == atReprovada){
				
		var campos = new Array();
		
		var mail_tratativa = i18n.translate("mail_cancelado");
		
		if(mapFields.acaoRequisicao != "cancelar"){
			mail_tratativa = i18n.translate("mail_reprovada");
			
			// Codigo para reprovado
			codigoDesbloqueio = dsCodigosIntegracao.getValue(0, "codReprovado");
			
			campos.push(mapFields.numReqCompra, mapFields.matriculaUser, numProcesso, codigoDesbloqueio, mapFields.acc);
			
			var datasetDesbloqueio = "Atento_SAP_Desbloquear_RC";
			if (tipoCompraSemIntegracao(mapFields.tipoCompra)) {
				datasetDesbloqueio = "Atento_NO_SAP";
			}
			
			var dataset = DatasetFactory.getDataset(datasetDesbloqueio, campos, null, null);
			
			if(dataset.getValue(0, "ERRO") != null){
				throw("ERRO: "+dataset.getValue(0,"ERRO"));
			}else if(dataset.getValue(0, "TYPE") == "E" || (dataset.getValue(0, "outputCode") != "200" && dataset.getValue(0, "outputCode") != "200.0")){
				if(!dataset.getValue(0, "CODE").equalsIgnoreCase("W5104")){
					throw("ERRO: "+dataset.getValue(0,"MESSAGE"));
				}
			}
			log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Requisicao " + mapFields.numReqCompra + " REJEITADA !!!");			
		}

		campos = new Array();
		
		var deleteInd = "X";
		
	    campos.push(							// [Indices]
				mapFields.totalFilhos,			// [00]
				mapFields.numReqCompra,			// [01]
				mapFields.centroCusto,			// [02]
				mapFields.tipoCompra,			// [03]
				mapFields.matriculaUser,		// [04]
				numProcesso,					// [05]
				mapFields.arrayCodPlanta,		// [06]
				mapFields.arrayCodMaterial,		// [07]
				mapFields.arrayQuantidade,		// [08]
				mapFields.arrayPreco,			// [09]
				mapFields.arrayDataRemessa,		// [10]
				mapFields.moeda,				// [11]
				mapFields.textoObservacao,		// [12]
				mapFields.numOrdemInterna,		// [13]
				mapFields.catClassifContabil,	// [14]
				mapFields.tipoPedido, 			// [15]
				deleteInd, 						// [16]
				mapFields.codFornecedor,		// [17]
				mapFields.codigoDocVendas,		// [18]
				mapFields.codigoCliente,		// [19]
				mapFields.siteOperacao,			// [20]
				mapFields.produtoPrincipal,		// [21]
				mapFields.centroLucro,			// [22]
				mapFields.arrayObsMaterial,		// [23]
				mapFields.acc					// [24]
			);
		
	    var datasetModificacao = "Atento_SAP_Modificar_RC";
		if (tipoCompraSemIntegracao(mapFields.tipoCompra)) {
			datasetModificacao = "Atento_NO_SAP";
		}
		
		var dataset = DatasetFactory.getDataset(datasetModificacao, campos, null, null);		

		if(dataset.getValue(0, "ERRO") != null){
			throw("ERRO: "+dataset.getValue(0,"ERRO"));
		}else if(dataset.getValue(0, "TYPE") == "E"){
			throw("ERRO: "+dataset.getValue(0,"MESSAGE"));
		}
		
		log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] Requisicao " + mapFields.numReqCompra + " REPROVADA !!!");
		
		if(emailUsuario != ""){
			assuntoEmail=i18n.translate("mail_title");
			
			conteudoEmail+=i18n.translate("mail_mensagemNumeroProcesso")+" "+numProcesso +" ";
			conteudoEmail+=i18n.translate("mail_requisicaoNumero")+": "+mapFields.numReqCompra;
			conteudoEmail+=mail_tratativa+"<br />";
			
			log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] emailUsuario: " + emailUsuario);			
			
			enviarEmail(emailUsuario, assuntoEmail, conteudoEmail);
		}
	}
	
	log.info("[Requisicao Compra] [beforeStateEntry] [numProcess: " + numProcesso + "] [sequenceId: " + sequenceId + "] FINAL");
}

function enviarEmail(emailCliente, assuntoEmail, conteudoEmail){
	
	var numProcesso = getValue("WKNumProces");
	
	try{
		
		var svc = ServiceManager.getService('servicoIntegracao');
	    var serviceHelper = svc.getBean();
	    var serviceLocator = serviceHelper.instantiate('br.com.totvs.fluig.service.soap.impl.ServicoEmailCustomizadoImplServiceLocator');
	    var service = serviceLocator.getServicoEmailCustomizadoImplPort();
	    var dadosEmail = serviceHelper.instantiate('br.com.totvs.fluig.service.soap.DadosEmailDTO');
	    
		emailCliente = emailCliente.replace(";", ",");
		var arrEmailCliente;
		if (emailCliente.indexOf(",") >= 0) {
			arrEmailCliente = emailCliente.split(",");
		} else {
			arrEmailCliente = [emailCliente];
		}
		// RETIRA ESPAcOS EM BRANCO PARA EVITAR ERROS
		for ( var e = 0; e < arrEmailCliente.length; e++) {
			arrEmailCliente[e] = arrEmailCliente[e].trim();
		}
		dadosEmail.setDestinatarios(arrEmailCliente);
		
		dadosEmail.setAssuntoEmail(assuntoEmail);
	
		conteudoEmail = conteudoEmail.replace("\n", "<br>");
	
		dadosEmail.setConteudoEmailHTML(conteudoEmail);
	    dadosEmail.setArea("Financas");
	
		service.enviarEmail(dadosEmail);
	
	} catch (e) {
		log.info("[Requisicao Compra] [beforeStateEntry] [enviarEmail] [numProcess: " + numProcesso + "] ERRO ao enviar e-mail: " + e);
	}
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