function validarAnexo(){
	
	var numProcesso = getValue("WKNumProces");
	var numAtiv = getValue("WKCurrentState");
	
	log.info("[Requisicao Compra] [validarAnexo] [numProcess: " + numProcesso + "] INIT");
	log.info("[Requisicao Compra] [validarAnexo] [numAtiv: " + numAtiv + "] INIT");

	if(hAPI.getCardValue("acaoRequisicao") == "criar" || hAPI.getCardValue("acaoRequisicao") == "modificar"){
		
		if(numAtiv == 129){
			var anexos = hAPI.listAttachments();
			var qtdAnexos = anexos.size();
			var qtdAnexosBefore = hAPI.getCardValue("qtdAnexosBefore");
			
			log.info("[Requisicao Compra] [validarAnexo] [anexos: " + qtdAnexos + "]");
			log.info("[Requisicao Compra] [validarAnexo] [tipoCompra: " + hAPI.getCardValue("tipoCompra") + "]");
			log.info("[Requisicao Compra] [validarAnexo] [qtdAnexosBefore: " + qtdAnexosBefore + "]");
			
			if(hAPI.getCardValue("tipoCompra") == "RFI" || hAPI.getCardValue("tipoCompra") == "CATALOGO" || 
					hAPI.getCardValue("tipoCompra") == "PRORROG"){
				log.info("[Requisicao Compra] [validarAnexo] [dentro if]");
				if(qtdAnexos <= qtdAnexosBefore){
					var erro = i18n.translate("faltaAnexoComprador");
					throw erro;
				}
			}			
		}
		
		if(hAPI.getCardValue("tipoCompra") == "REGULAR" || 
		   hAPI.getCardValue("tipoCompra") == "CONDIC" || 
		   hAPI.getCardValue("tipoCompra") == "RFI" || 
		   hAPI.getCardValue("tipoCompra") == "PRORROG" || 
		   hAPI.getCardValue("tipoCompra") == "GERALCOND" || 
		   hAPI.getCardValue("tipoCompra") == "PONTUALCOND" ||  
		   hAPI.getCardValue("tipoCompra") == "CATALOGO"){
		
			var docs = hAPI.listAttachments();
			
			log.info("[Requisicao Compra] [validarAnexo] [numProcess: " + numProcesso + "] docs.size: " + docs.size());
			
			if (docs.size() == 0){
				log.info("[Requisicao Compra] [validarAnexo] [numProcess: " + numProcesso + "] Anexo não encontrado");
				var tipoCompra = hAPI.getCardValue("tipoCompra").toUpperCase().trim();
				var msg = "";
				var msgTipoCompra = "";
				
				log.info("[Requisicao Compra] [validarAnexo] [numProcess: " + numProcesso + "] Anexo não encontrado");				
				
				if (tipoCompra == "REGULAR"){
					msgTipoCompra = i18n.translate("REGULAR");
				}
				else if (tipoCompra == "CONDIC") {
					msgTipoCompra = i18n.translate("CONDIC");
				}
				else if (tipoCompra == "RFI") {
					msgTipoCompra = i18n.translate("RFI");
				}
				else if (tipoCompra == "PRORROG") {
					msgTipoCompra = i18n.translate("PRORROG");
				}
				else if (tipoCompra == "GERALCOND") {
					msgTipoCompra = i18n.translate("GERALCOND");
				}
				else if (tipoCompra == "PONTUALCOND") {
					msgTipoCompra = i18n.translate("PONTUALCOND");
				}
				else if (tipoCompra == "CATALOGO") {
					msgTipoCompra = i18n.translate("CATALOGO");
				}
				msg = i18n.translate("evidenciasNaoAnexadas1")+" "+ msgTipoCompra+i18n.translate("evidenciasNaoAnexadas2")+"\n";
				throw msg;
			}
		}
	}
	
	log.info("[Requisicao Compra] [validarAnexo] [numProcess: " + numProcesso + "] FINAL");
	
	return false;
}