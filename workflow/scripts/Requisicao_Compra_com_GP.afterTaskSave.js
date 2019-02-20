function afterTaskSave(colleagueId,nextSequenceId,userList){
	var numProces = getValue("WKNumProces");
	
/* Duplicando nome do aprovador quando é feito via mobile
	
	var numeroProcesso = getValue("WKNumProces");
	var valor = hAPI.getCardData(numeroProcesso);
	
	log.info("process finish");
	
	var documentId = valor.get("documentid");
	
	var query = "select MAX(META_LISTA.COD_LISTA) as codigo from META_LISTA inner join META_LISTA_REL on META_LISTA_REL.COD_LISTA_FILHO = META_LISTA.COD_LISTA where DSL_LISTA = 'Requisicao_Compra' and META_LISTA_REL.COD_TABELA = 'rc_aprovadores'";

	var tabela = "ML001";  
	var codigo = "";
	
	log.info("process finish dataset");
	
	var c1 = DatasetFactory.createConstraint("dataSource", "jdbc/FluigDS", "", ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("query", query , "", ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	var dataset = DatasetFactory.getDataset("dsDataSourceQuery", new Array(), constraints, new Array());
	
	log.info("process finish result");
	
	if (dataset.rowsCount > 0) {
		user = new Object();
		for(var i=0; i < dataset.rowsCount; i++) {
			codigo = new java.lang.String(dataset.getValue(i,"codigo")+"");
			break;
		}	
	}
	
	log.info("process finish codigo"+codigo+" "+codigo.length());
	
	if(codigo.length() == 3){
		tabela += codigo; 
	}else if(codigo.length() == 2){
		tabela += "0"+codigo;
	}else if(codigo.length() == 1){
		tabela += "00"+codigo;
	}
	
	log.info("process finish tabela"+tabela);
	
	var queryDelete = "delete from "+tabela+" where documentId = "+documentId+" AND grupoAprovador  IS NULL AND optAProvar IS NULL AND nomeAprovador IS NULL";

	if(hAPI.getCardValue("isMobile") == "true"){
		
		log.info("Query delete duplicado mobile "+queryDelete);
					
		var c3 = DatasetFactory.createConstraint("dataSource", "jdbc/FluigDS", "", ConstraintType.MUST);
		var c4 = DatasetFactory.createConstraint("query", queryDelete , "", ConstraintType.MUST);
		var constraints2 = new Array(c3, c4);
		DatasetFactory.getDataset("dsDataSourceQuery", new Array(), constraints2, new Array());
		
		log.info("Executou delete duplicado "+queryDelete);
		
	} */
	var anexos = hAPI.listAttachments();
	var qtdAnexos = anexos.size();
	hAPI.setCardValue("qtdAnexos", qtdAnexos);	
	hAPI.setCardValue("qtdAnexosBefore", qtdAnexos);	
	
	log.info("[Requisicao Compra] [afterTaskSave] [numProcess: " + numProces + "]");
	log.info("[Requisicao Compra] [afterTaskSave] [identificador: " + hAPI.getCardValue("identificador") + "]");
	log.info("[Requisicao Compra] [afterTaskSave] [projetoAriba: " + hAPI.getCardValue("projetoAriba") + "]");
	if(hAPI.getCardValue("identificador") != "" && hAPI.getCardValue("projetoAriba") != "" && hAPI.getCardValue("flgProjetoAriba") == "")  {
		var identificador = hAPI.getCardValue("identificador");
		identificador = identificador + " - " + hAPI.getCardValue("projetoAriba");
		hAPI.setCardValue("identificador", identificador);
		hAPI.setCardValue("flgProjetoAriba", "1");
	} 
	
	log.info("[Requisicao Compra] [afterTaskSave] [identificador: " + hAPI.getCardValue("identificador") + "[end]");
}