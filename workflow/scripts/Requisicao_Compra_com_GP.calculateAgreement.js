/****** 
** Enable customization script to change agreement calculation. 
** Input: 
**	stateId -> Current state, whose agreement percentage is being calculated. 
**	agreementData.get("currentPercentage") -> Current percentage, calculated by the workflow engine
**	agreementData.get("currentDestState") -> Current destination state. Zero, if process won't move
**	agreementData.get("currentDestUsers") -> Current destination users. Empty if process won't move
**/
function calculateAgreement(currentState, agreementData) {
	
	var numProcesso = getValue("WKNumProces");
	log.info("[Requisicao Compra] [calculateAgreement] [numProcess: " + numProcesso + "] [currentState: " + currentState + "] INIT");	
	
	agreementData.put("currentPercentage",100);
	
	var proxAtiv;
	var proxDestino;
	
	var fields = new Array(numProcesso, "Requisicao_Compra_com_GP");
	
	if(currentState == 7 || currentState == 96){
		if(verificarReprova()){
			proxAtiv = 89;
			proxDestino = "";
		}
		else if(hAPI.getCardValue("tipoDespesa") == "F" && hAPI.getCardValue("capexAprovado") == "false"){
			proxAtiv = 96;
			
			var dataset = DatasetFactory.getDataset("mecanismo_aprovador_capex", fields, null, null);
			proxDestino = dataset.getValue(0, "usuarios");
		}
		else if(verificarAprovMaterial()){
			proxAtiv = 70;
			
			var dataset = DatasetFactory.getDataset("mecanismo_aprovadores_materiais", fields, null, null);
			proxDestino = dataset.getValue(0, "usuarios");
		}else{
			proxAtiv = 35;
			
			var dataset = DatasetFactory.getDataset("mecanismo_nivel_aprovador", fields, null, null);
			proxDestino = dataset.getValue(0, "usuarios");
			
		}
	}else{
		proxAtiv = 50;
		
		log.info("[Requisicao Compra] [calculateAgreement] [numProcess: " + numProcesso + "] [currentState: " + currentState + "] currentDestUsers: " + agreementData.get("currentDestUsers"));	
		
		//var dataset = DatasetFactory.getDataset("mecanismo_analista_compra", fields, null, null);
		//proxDestino = dataset.getValue(0, "usuarios");
		proxDestino = "System:Auto";
	}
	
	log.info("[Requisicao Compra] [calculateAgreement] [numProcess: " + numProcesso + "] [currentState: " + currentState + "] proxAtiv: " + proxAtiv);
	log.info("[Requisicao Compra] [calculateAgreement] [numProcess: " + numProcesso + "] [currentState: " + currentState + "] proxDestino: " + proxDestino);
	
	agreementData.put("currentDestState", proxAtiv);
	agreementData.put("currentDestUsers", proxDestino);
	
	log.info("[Requisicao Compra] [calculateAgreement] [numProcess: " + numProcesso + "] [currentState: " + currentState + "] FINAL");
}