function verificarReprova(){
	var numProces = getValue("WKNumProces");
	
	var mapFields = getFormRequestFields();
	
	var cardData = hAPI.getCardData(numProces);
	
	var aprovado = "";
	
	if(hAPI.getCardValue("isMobile") == "true"){
	
		for(var x = 1; x < 100; x++){
		
			try{
	
				var valor = cardData.get("aprovador___"+x).split(";");
				log.info("valor aprovador:"+ valor.length);
				
				if(valor.length == 4){
					aprovado = valor[3];
			        x = 101;				
				}
							
			}catch(e){
				log.info(e);
			}
		}
	}
	
	log.info("[Requisicao Compra] [verificarReprova] [numProcess: " + numProces + "] INIT");
	
	log.info("[Requisicao Compra] [verificarReprova] [numProcess: " + numProces + "] Total Aprovadores: " + mapFields.totalAprovadores);
	
	var strOptAprovar = mapFields.arrayOptAprovar;
	var arrayOptAprovar = strOptAprovar.split(";");
	
	for (var i = 0; i < arrayOptAprovar.length; i++) {
		if (arrayOptAprovar[i] == "nao" || aprovado == "nao"){
			return true;
		}
	}
	
    log.info("[Requisicao Compra] [verificarReprova] [numProcess: " + numProces + "] Nenhuma reprova com retorno");
    log.info("[Requisicao Compra] [verificarReprova] [numProcess: " + numProces + "] FINAL");
    return false;
}