function afterProcessCreate(processId) {
	log.info("[Requisicao Compra] [afterProcessCreate] [numProcess: " + processId + "] INIT");
	
	hAPI.setCardValue("numero_processo", processId);
	
	conteudoEmail = "<p>" + i18n.translate("mail_processo") + " " + hAPI.getCardValue("numero_processo") + " " + i18n.translate("mail_processo_iniciado") + "</p>";
	
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", getValue("WKUser"), getValue("WKUser"), ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("active", "true", "true", ConstraintType.MUST);
	
	var constraints = new Array(c1, c2);
	
	var dataset = DatasetFactory.getDataset("colleague", null, constraints, null);
	if(dataset.rowsCount > 0){
		emailUsuario = dataset.getValue(0, "mail");
	}
	
	enviarEmail(emailUsuario, i18n.translate("mail_title"), conteudoEmail);
	
	log.info("[Requisicao Compra] [afterProcessCreate] [numProcess: " + processId + "] FINAL");
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
		// RETIRA ESPA?OS EM BRANCO PARA EVITAR ERROS
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
		log.info("[Requisicao Compra] [afterProcessCreate] [enviarEmail] [numProcess: " + numProcesso + "] ERRO ao enviar e-mail: " + e);
	}
}