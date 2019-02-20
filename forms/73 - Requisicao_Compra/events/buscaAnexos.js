function buscaAnexos(){
	var idProcess = getValue("WKNumProces");
	
	//Todos os anexos no processo
	var c1 = DatasetFactory.createConstraint("processAttachmentPK.processInstanceId", idProcess, idProcess, ConstraintType.MUST);
	var constraints = new Array(c1);
	var anexos = DatasetFactory.getDataset("processAttachment", null, constraints, null);
	var anexosReais = null;
	
	if(anexos.rowsCount > 0){
		//Filtra para pegar somente os anexos ativos e não pegar o formulário (tipo = 5)
		var constraintsAnexos = new Array();
		constraintsAnexos.push(DatasetFactory.createConstraint("activeVersion", "true", "true", ConstraintType.MUST));
		constraintsAnexos.push(DatasetFactory.createConstraint("documentType", 5, 5, ConstraintType.MUST_NOT));
		
		for(var a = 0; a < anexos.rowsCount; a++){
			constraintsAnexos.push(DatasetFactory.createConstraint("documentPK.documentId", anexos.getValue(a, "documentId"), anexos.getValue(a, "documentId"), ConstraintType.SHOULD));
		}
		
		anexosReais = DatasetFactory.getDataset("document", null, constraintsAnexos, null);
	}
	
	return anexosReais;
}