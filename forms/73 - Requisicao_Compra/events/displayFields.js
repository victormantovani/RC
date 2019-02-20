
function displayFields(form,customHTML){
	var ativ = getValue("WKNumState");
	var usuario = getValue("WKUser");
	var secaoAEsconder = "";
	var centroLucro = verificaCentroLucroPais(form.getValue("accSolicitante"));
	
	customHTML.append("<script type='text/javascript'>");
	customHTML.append("\n\t var flgAtTriarRequisicao = false\n");
	
	var atInicial = 2;
	var atAprovarBudget = 7;
	var atAprovarGrupoMaterial = 70;
	var atAprovadores = 35;
	var atAprovadorCapex = 96;
	var atTriarRequisicao = 118;
	var atNumPedido = 122;
	var atVisualizador = 135;
	var atReprovado = 89;
	var atRegistrarSemIntegracao = 129;
	var atRetorno = 131;
	var atReqAprovada = 132;
	
	var mobile = form.getMobile();
	form.setValue("isMobile", mobile);
	form.setValue("userLogin",getValue("WKUser"));
	
	customHTML.append("var FORM_MODE = '"+form.getFormMode() +"';");
	form.setValue("atividade", ativ);
	
	customHTML.append("\t$('#dataProrrogacao').hide();\n");
	customHTML.append("\t$('#tabelaProrrogacao').hide();\n");
	customHTML.append("\t$('.secaoF').hide();\n");
	
	if(ativ == 0){
		var cUser1 = DatasetFactory.createConstraint("codUsuarioFluig", usuario, usuario, ConstraintType.MUST);
		var cUser2 = DatasetFactory.createConstraint("metadata#active", "true", "true", ConstraintType.MUST);
		var cUser = new Array(cUser1, cUser2);
		
		var dtUser = DatasetFactory.getDataset("atento_usuarios_Fluig_SAP", null, cUser, null);
		if(dtUser.rowsCount > 0){
			form.setValue("paisSolicitante", dtUser.getValue(0, "cod_pais"));
			form.setValue("accSolicitante", dtUser.getValue(0, "cod_acc"));
			form.setValue("usuarioCorporativo", dtUser.getValue(0, "corp"));
		}else{
			customHTML.append("alert('"+i18n.translate("usuarioNaoCadastrado")+"')");
		}
	}
	
	if(ativ == atInicial || ativ == "0"){
		form.setValue("solicitante", usuario);

		var solicitante = usuario;

		form.setValue("budgetAprovado", "false");
		form.setValue("capexAprovado", "false");
		form.setValue("grupoMaterialAprovado", "false");
		form.setValue("todosNiveisAprovados", "false");
		form.setValue("requisicaoLiberada", "false");
		form.setValue("triagemAprovada", "false");
		
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		customHTML.append("\t$('.areaRequisicao').hide();\n");
		customHTML.append("\t$('.secaoC').hide();\n");
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		
		customHTML.append("\t$('.secaoD').hide();\n");
		//customHTML.append("\tsetInterval('confereAnexos()', 3000);\n");
		customHTML.append("\t$('#div-numero-processo').hide();\n");
		//customHTML.append("\tlistarRCParaCopia('"+solicitante+"');\n");
		
		
		
		exibeSecaoA(form, customHTML);
		
		form.setValue("matriculaUsuarioFluig", solicitante);
		form.setValue("usuarioFluig", getNomeUsuario(solicitante));
		form.setValue("emailUsuario", getEmailUsuario(solicitante));
		
	} else if (ativ == atVisualizador){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		customHTML.append("\tdesativarLinks();\n");//Desabilita os botoes para chamar ZOOM
		customHTML.append("\t$('.imgTabela').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		customHTML.append("\t$('.secaoC').hide();\n");
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		
	}else if(ativ == atAprovarBudget){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		criarAprovador("Control Management", form, customHTML);
		
		form.setValue("budgetAprovado", "true");
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		
	}else if(ativ == atAprovarGrupoMaterial){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		criarAprovador("Material Aproval Group", form, customHTML);
		
		form.setValue("grupoMaterialAprovado", "true");
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
	}else if(ativ == atAprovadorCapex){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		criarAprovador("Capex Aproval", form, customHTML);
		
		form.setValue("capexAprovado", "true");
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");

		customHTML.append("\t$('.codigoServico.brasil').hide();\n");
		customHTML.append("\t$('.codigoServico.ahora').hide();\n");
	}else if(ativ == atAprovadores){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		var levalAprov = form.getValue("actualLevelAproval");
		if(levalAprov == ""){
			levalAprov = "1";
			form.setValue("actualLevelAproval", "1");
		}
		
		criarAprovador("Level "+levalAprov+" Aproval", form, customHTML);
		
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		
		if(form.getValue("tipoCompra") != "Z"){
			customHTML.append("\t$('.codigoServico.brasil').hide();\n");
			customHTML.append("\t$('.codigoServico.ahora').hide();\n");
		} else if(centroLucro && form.getValue("tipoCompra") == "Z"){
			customHTML.append("\t$('.codigoServico.brasil').show();\n");
		} else{
			customHTML.append("\t$('.codigoServico.brasil').hide();\n");
		}
	}else if(ativ == atTriarRequisicao){
		form.setValue("triagemAprovada", "true");
		customHTML.append("\n\t flgAtTriarRequisicao = true\n");
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		//Liberar tipo de compra para edição
		form.setEnabled("codigoFornecedor", true);
		form.setEnabled("btncodigoFornecedor", true);
		customHTML.append('\t$("#btncodigoFornecedor").attr("onclick", "openZoomCodigoFornecedor(this)");\n');

		criarAprovador("Purchasing Manager", form, customHTML);
		
		customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.secaoE').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");

		if(form.getValue("tipoCompra") != "Z"){
			customHTML.append("\t$('.codigoServico.brasil').hide();\n");
			customHTML.append("\t$('.codigoServico.ahora').hide();\n");
		} else if(centroLucro && form.getValue("tipoCompra") == "Z"){
			customHTML.append("\t$('.codigoServico.brasil').show();\n");
		} else{
			customHTML.append("\t$('.codigoServico.brasil').hide();\n");
		}
	}else if(ativ == atNumPedido){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		var indexes = form.getChildrenIndexes("rc_aprovadores");
		for(var i = 0; i < indexes.length; i++){
			form.setEnabled("optAProvar___"+indexes[i], false);
		}
		
		customHTML.append("\t$('.secaoE').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		form.setValue("secaoAEsconder",".secaoE");
	} else if(ativ == atRegistrarSemIntegracao){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		var indexes = form.getChildrenIndexes("rc_aprovadores");
		for(var i = 0; i < indexes.length; i++){
			form.setEnabled("optAProvar___"+indexes[i], false);
		}
		
		//customHTML.append("\t$('.secaoD').hide();\n");
		customHTML.append("\t$('.escondeNumPedidoGerado').hide();\n");
		customHTML.append("\t$('.escondeStatusPedido').hide();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		form.setValue("secaoAEsconder",".secaoD");
	} else if(ativ == atRetorno){
		bloqueiaSecaoA(form, customHTML);
		exibeSecaoA(form, customHTML);
		
		var indexes = form.getChildrenIndexes("rc_aprovadores");
		for(var i = 0; i < indexes.length; i++){
			form.setEnabled("optAProvar___"+indexes[i], false);
		}
		
		criarRecebedor("Requester", form, customHTML);
		
		var secaoEscondida = form.getValue("secaoAEsconder");
		if (secaoEscondida != ".secaoD"){
			customHTML.append("\t$('"+secaoEscondida+"').hide();\n");
		}
		
		if(form.getValue("numPedidoGerado") == "" && form.getValue("statusPedido") == "" ) {
			customHTML.append("\t$('.escondeNumPedidoGerado').hide();\n");
			customHTML.append("\t$('.escondeStatusPedido').hide();\n");
		}
		
		bloqueiaSecaoD(form, customHTML);
		
		form.setEnabled("comentarioComprador", false);
		customHTML.append("\t$('.secaoF').show();\n");
		customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
	}

	if(form.getFormMode() == "VIEW"){
		customHTML.append("$(document).ready(function() {if (($('#justificativa').html()) && ($('#justificativa').html()!='&nbsp;')){" +
				"$('.justificativa').show();}else{"+
				"$('.justificativa').hide();}})\n");
		exibeSecaoA(form, customHTML);
		customHTML.append("\tdesativarLinks();\n");//Desabilita os botoes para chamar ZOOM
		customHTML.append("\t$('.imgTabela').hide();\n");
		

		var tipoCompra = form.getValue("tipoCompra");
		
		if(tipoCompra == "RFI" || tipoCompra == "CATALOGO" || tipoCompra == "PRORROG") {
			customHTML.append("\t$(document).ready(function() {\n");
			customHTML.append("\t$('#totalEmoeda').hide();\n");
			customHTML.append("})\n");
		}
		
		if (tipoCompra == "RFI" || tipoCompra == "CATALOGO"){
			customHTML.append("\t$(document).ready(function() {\n");
			customHTML.append("\t$('#fgRequisicaoSap').hide();\n");
			customHTML.append("\t$('.escondeNumPedidoGerado').hide();\n");
			customHTML.append("\t$('.escondeStatusPedido').hide();\n");
			//customHTML.append("\t$('.secaoD').hide();\n");
			customHTML.append("})\n");
		}
		
		if (tipoCompra == "PRORROG") {
			customHTML.append("\t$(document).ready(function() {\n");
			customHTML.append("\t$('#dataProrrogacao').show();\n");
			customHTML.append("\t$('#tabelaProrrogacao').show();\n");
			customHTML.append("\t$('#materiais').hide();\n");
			//customHTML.append("\t$('#totalEmoeda').hide();\n");
			customHTML.append("\t$('#dataRequisicaoSap').hide();\n");
			customHTML.append("\t$('#fgRequisicaoSap').hide();\n");
			customHTML.append("\t$('.escondeNumPedidoGerado').hide();\n");
			customHTML.append("\t$('.escondeStatusPedido').hide();\n");
			//customHTML.append("\t$('.secaoD').hide();\n");
			customHTML.append("})\n");

			form.setValue("txtNumeroContrato",form.getValue("numeroContrato"));
			form.setValue("txtDataInicio",form.getValue("dataInicio"));
			form.setValue("txtDataFim",form.getValue("dataFim"));
			form.setValue("txtFornecedorProrrogacao",form.getValue("fornecedorProrrogacao"));
		}
		if(ativ == atRetorno || ativ == atReqAprovada){
			customHTML.append("\t$('.secaoF').show();\n");
		}
		
		if(form.getValue("acaoRequisicao") == "criar"){
			customHTML.append("\t$('.camposPesquisaRequisicao').hide();\n");
		}else if(form.getValue("acaoRequisicao") == "cancelar" || form.getValue("acaoRequisicao") == "visualizar"){
			customHTML.append("\t$('.camposPesquisaRequisicao').show();\n");
		}
		
		if(centroLucro && form.getValue("tipoCompra") == "Z"){
			log.info("Requisição de Compras | Display Fields | Mostrar Vendas Brasil");
			customHTML.append("\t$('.codigoServico.brasil').show();\n");
		} else{
			log.info("Requisição de Compras | Display Fields | Esconder Vendas Brasil");
			customHTML.append("\t$('.codigoServico.brasil').hide();\n");
		}
	}
	
	if(form.getFormMode() == "MOD"){
			
		var tipoCompra = form.getValue("tipoCompra");
				
		//customHTML.append("$(document).ready(function() {$('.justificativa').hide();})\n");
		
		if (tipoCompra == "RFI" || tipoCompra == "CATALOGO"){
			customHTML.append("$(document).ready(function() {$('#fgRequisicaoSap').hide();})\n");
		}
	}
	
	customHTML.append("</script>");
}

function bloqueiaSecaoA(form, customHTML){
	var tpCompra = form.getValue("tipoCompra");
	var ativ = getValue("WKNumState");
	var atTriarRequisicao = 118;
	form.setEnabled("acaoRequisicao", false);
	form.setEnabled("numRequisicao", false);
	form.setEnabled("pesqRequisicao", false);
	form.setEnabled("tipoDespesa", false);
	form.setEnabled("centroCusto", false);
	form.setEnabled("btnCentroCusto", false);
	form.setEnabled("ordemInterna", false);
	form.setEnabled("btnOrdemInterna", false);
	form.setEnabled("servico", false);
	form.setEnabled("btnCodigoServico", false);
	if (ativ == atTriarRequisicao && (tpCompra != "RFI" && tpCompra != "PRORROG" && tpCompra != "CATALOGO")){
		form.setEnabled("tipoCompra", true);
		customHTML.append("\t$('#tipoCompra option[value=\"RFI\"]').remove();\n");
		customHTML.append("\t$('#tipoCompra option[value=\"PRORROG\"]').remove();\n");
		customHTML.append("\t$('#tipoCompra option[value=\"CATALOGO\"]').remove();\n");
	} else {
		form.setEnabled("tipoCompra", false);
	}
	form.setEnabled("codigoFornecedor", false);
	form.setEnabled("btncodigoFornecedor", false);
	form.setEnabled("moeda", false);
	form.setEnabled("totalRC", false);
	form.setEnabled("usuarioFluig", false);
	form.setEnabled("requisicaoSAP", false);
	form.setEnabled("dataRequisicao", false);
	form.setEnabled("obsRC", false);
	form.setEnabled("tituloProcesso", false);
	
	var indexes = form.getChildrenIndexes("rc_atento");
	for(var i = 1; i <= indexes.length; i++){
		form.setEnabled("planta___" + i, false);
		form.setEnabled("material___" + i, false);
		form.setEnabled("quantidade___" + i, false);
		form.setEnabled("observacaoMaterial___" + i, false);
		form.setEnabled("preco___" + i, false);
		form.setEnabled("dtRemessa___" + i, false);
	}
	
	customHTML.append("\tdesativarLinks();\n");//Desabilita os botoes para chamar ZOOM
	customHTML.append("\t$('.imgTabela').hide();\n");
}

function exibeSecaoA(form, customHTML){
	var userLogin = getValue("WKUser");
	var roles = getRolesByUserLogin(userLogin);
	var tipoCompra = form.getValue("tipoCompra");
	var tipoDespesa = form.getValue("tipoDespesa");

	form.setValue("userRoles",roles.join(","));
	
	var roleStr = roles.toString();
	
	if (roleStr.indexOf("areaContratos") == -1){
		customHTML.append("$(\"#tipoCompra\").children(\"option[value='CATALOGO']\").remove();\n");
	}
	
	if(form.getValue("acaoRequisicao") != ""){
		if(form.getValue("acaoRequisicao") == "criar"){
			customHTML.append("\t$('.areaPesquisa').hide();\n");
			customHTML.append("\t$('.areaRequisicao').show();\n");
			customHTML.append("\t$('.areaCompanyCode').show();\n");
		}else if(form.getValue("acaoRequisicao") == "cancelar" || form.getValue("acaoRequisicao") == "modificar"){
			customHTML.append("\t$('.camposPesquisaRequisicao').show();\n");
		}
		
		var tipoDespesa = form.getValue("tipoDespesa");
		
		if(tipoDespesa == "F"){
			customHTML.append("\t$('.ordemInterna').show();\n");
			customHTML.append("\t$('.codigoServico').show();\n");
		}else if(tipoDespesa == "Z"){
			customHTML.append("\t$('.codigoServico').show();\n");
		}
		
		customHTML.append("\t$('.pesquisarCentroCusto').show();\n");
		customHTML.append("\t$('.tipoCompra').show();\n");
		
		if (tipoCompra != "" && 
			tipoCompra != "PRORROG") {
			customHTML.append("\t$('.tabelaMateriais').show();\n");
		}
		
		if(tipoCompra == "DELEGADA" 	|| 
		   tipoCompra == "REGULAR"  	||
		   tipoCompra == "GERALCOND"	||
		   tipoCompra == "PONTUALCOND"
		){
			customHTML.append("\t$('.codigoFornecedor').show();\n");
		}
		
		if(tipoCompra == "RFI" || tipoCompra == "CATALOGO" || tipoCompra == "PRORROG") {
			customHTML.append("\t$(document).ready(function() {\n");
			customHTML.append("\t$('#totalEmoeda').hide();\n");
			customHTML.append("})\n");
		}	
		
		if (tipoCompra == "PRORROG") {

			customHTML.append("\t$('#dataProrrogacao').show();\n");
			customHTML.append("\t$('#tabelaProrrogacao').show();\n");
			customHTML.append("\t$('#materiais').hide();\n");
			//customHTML.append("\t$('#totalEmoeda').hide();\n");
			customHTML.append("\t$('#dataRequisicaoSap').hide();\n");
			customHTML.append("\t$('#fgRequisicaoSap').hide();\n");
			
		}
		
		customHTML.append("\t$('.campoTituloIdentificador').show();\n");
	}
}

function bloqueiaSecaoD(form, customHTML) {
	form.setEnabled("numPedidoGerado", false);
	form.setEnabled("statusPedido", false);
	form.setEnabled("projetoAriba", false);
}

function getRolesByUserLogin(userLogin){
	
	var constraint = DatasetFactory.createConstraint("workflowColleagueRolePK.colleagueId", userLogin, userLogin, ConstraintType.MUST); 
	var constraints = new Array(constraint); 
	var dsRoles = DatasetFactory.getDataset("workflowColleagueRole", null,constraints, null); 

	log.info("[getRolesByUserLogin] UserLogin: "+userLogin);
	log.info("[getRolesByUserLogin] RowCount: "+dsRoles.rowsCount);
	
	var roles = new Array();
	
	for (var r = 0; r < dsRoles.rowsCount; r++) {
		log.info("[getRolesByUserLogin] Role: "+dsRoles.getValue(r,"workflowColleagueRolePK.roleId"));
		roles.push(dsRoles.getValue(r,"workflowColleagueRolePK.roleId"));
	}
	
	return roles;
}

function criarAprovador(nomeGrupo, form, customHTML){
	var indexes = form.getChildrenIndexes("rc_aprovadores");
	var user = getValue("WKUser");
	var nomeUsuario = getNomeUsuario(user);
	var jaPossui = false;
	
	for(var i = 0; i < indexes.length; i++){
		form.setEnabled("optAProvar___"+indexes[i], false);
		
		if(form.getValue("grupoAprovador___"+indexes[i]) == nomeGrupo && form.getValue("aprovador___"+indexes[i]) == user){
			jaPossui = true;
			form.setEnabled("optAProvar___"+indexes[i], true);
		}
	}
	
	if(!jaPossui){
		customHTML.append("\twdkAddChild('rc_aprovadores');\n");
		customHTML.append("\tsetAprovers('"+nomeGrupo+"', '"+user+"', '"+nomeUsuario+"', '"+(indexes.length+1)+"');\n");
	}
}

function criarRecebedor(nomeGrupo, form, customHTML){
	var indexes = form.getChildrenIndexes("tb_recebedor");
	var user = getValue("WKUser");
	var nomeUsuario = getNomeUsuario(user);
	var jaPossui = false;
	
	for(var i = 0; i < indexes.length; i++){
		form.setEnabled("optConfirma___"+indexes[i], false);
		
		if(form.getValue("grupoRecebedor___"+indexes[i]) == nomeGrupo && form.getValue("nomeRecebedor___"+indexes[i]) == user){
			jaPossui = true;
		}
	}
	
	if(!jaPossui){
		customHTML.append("\twdkAddChild('tb_recebedor');\n");
		customHTML.append("\tsetReceivers('"+nomeGrupo+"', '"+user+"', '"+nomeUsuario+"', '"+(indexes.length+1)+"');\n");
	}
}

function getNomeUsuario(usuario) {

	var nomeUsuario = null;

	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", usuario, usuario, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("active", "true", "true", ConstraintType.MUST);

	var constraints = new Array(c1, c2);

	var dataset = DatasetFactory.getDataset("colleague", null, constraints, null);

	if(dataset.rowsCount > 0){
		nomeUsuario = dataset.getValue(0, "colleagueName");
	}

	return nomeUsuario;
}

function getEmailUsuario(usuario) {
	
	var emailUsuario = null;
	
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId", usuario, usuario, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("active", "true", "true", ConstraintType.MUST);
	
	var constraints = new Array(c1, c2);
	
	var dataset = DatasetFactory.getDataset("colleague", null, constraints, null);
	
	if(dataset.rowsCount > 0){
		emailUsuario = dataset.getValue(0, "mail");
	}
	
	return emailUsuario;
}

function verificaCentroLucroPais(acc) {
	var c1 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("cod_acc", acc, acc, ConstraintType.MUST);
	var c3 = DatasetFactory.createConstraint("cbCentroLucro", "on", "on", ConstraintType.MUST);
	var filtro = new Array(c1, c2, c3);
	var dsCentroLucro = DatasetFactory.getDataset("Atento_Pais_Acc", null, filtro, null);

	if (dsCentroLucro == null || dsCentroLucro.values.length == 0) {
		return false;
	} else {
		return true;
	}
}