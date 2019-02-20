function verificarAprovMaterial(){
	var numProces = getValue("WKNumProces");
	log.info("[Requisicao Compra] [verificarAprovMaterial] [numProcess: " + numProces + "] INIT");
	
	if (hAPI.getCardValue("tipoCompra") == "RFI" || 
		hAPI.getCardValue("tipoCompra") == "PRORROG" || 
		hAPI.getCardValue("tipoCompra") == "CATALOGO") {
		log.info("[Requisicao Compra] [verificarAprovMaterial][TIPO COMPRA RFI CATALOGO OU PRORROG");
		return false;
	}
	
	var mapFields = getFormRequestFields();
	
	if(mapFields.grupoMaterialAprovado == "false"){
		
		var strGrupoMaterial = mapFields.arrayGrupoMaterial;
		var arrayGrupoMaterial = strGrupoMaterial.split(";");
		
		for (var i = 0; i < arrayGrupoMaterial.length; i++) {
			
			var grupoMaterial = arrayGrupoMaterial[i];
			
        	log.info("[Requisicao Compra] [verificarAprovMaterial] [numProcess: " + numProces + "] Grupo de Material: " + grupoMaterial);
        	
        	var cAM1 = DatasetFactory.createConstraint("cod_grupo_material", grupoMaterial, grupoMaterial, ConstraintType.MUST);
        	var cAprovador_material = new Array(cAM1);
            var dtAprovador_material = DatasetFactory.getDataset("atento_aprovador_material", null, cAprovador_material, null);
        	log.info("[Requisicao Compra] [verificarAprovMaterial] [numProcess: " + numProces + "] Aprovadores Encontrados: " + dtAprovador_material.rowsCount);

            if(dtAprovador_material.rowsCount > 0){
            	return true;
            }			
		}
	}
	
	log.info("[Requisicao Compra] [verificarAprovMaterial] [numProcess: " + numProces + "] Sem material para aprovacao");
	log.info("[Requisicao Compra] [verificarAprovMaterial] [numProcess: " + numProces + "] FINAL");
    return false;
}