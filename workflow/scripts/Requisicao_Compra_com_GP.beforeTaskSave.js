function beforeTaskSave(colleagueId,nextSequenceId,userList){
	var numProces = getValue("WKNumProces");
/* Duplicando nome do aprovador quando é feito via mobile
	
	var numeroProcesso = getValue("WKNumProces");
	var cardData = hAPI.getCardData(numeroProcesso);
	
	log.info(cardData);
	
	if(hAPI.getCardValue("isMobile") == "true"){
	
		for(var x = 1; x < 100; x++){
		
			try{
	
				var valor=  cardData.get("aprovador___"+x).split(";");
				log.info("valor aprovador:"+ valor.length);
				
				if(valor.length == 4){
	
					var childData = new java.util.HashMap();
			        childData.put("grupoAprovador", valor[1]);
			        childData.put("nomeAprovador", valor[2]);
			        childData.put("optAProvar", valor[3]);
			        childData.put("aprovador", valor[0]);
			        hAPI.addCardChild("rc_aprovadores", childData);
			        x = 101;				
				}
							
			}catch(e){
				log.info(e);
			}
		
		}
	
	} */
	
	validarAnexo();
}