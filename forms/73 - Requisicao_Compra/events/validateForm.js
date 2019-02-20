function validateForm(form){
	var ativ = getValue("WKNumState");
	var enviando = (getValue("WKCompletTask")=="true"); //verifica se processo foi salvo ou enviado

	var atInicial = 2;
	var atNumPedido = 122;
	var atVisualizador = 135;
	var atRegistrarSemIntegracao = 129;
	var atRetorno = 131;
	var atTriarRequisicao = 118;
	var atAprovarBudget = 7;
	var atAprovarGrupoMaterial = 70; 
	var atAprovadores = 35;
	var atAprovarCapex = 96;

	log.info("[Requisicao de Compra] [Validate Form]  ativ: " + ativ);
	log.info("[Requisicao de Compra] [Validate Form]  enviando: " + enviando);
	
	var isBrasil = false;
	
	var acc = form.getValue("accSolicitante");
	
	if(acc == "CC01" || acc == "CC02" || acc == "CC03")
		isBrasil = true;
	
	if((ativ == atInicial || ativ == 0) && enviando){
		log.info("[Requisicao de Compra] [Validate Form]  Acao: " + form.getValue("acaoRequisicao"));
		log.info("[Requisicao de Compra] [Validate Form]  Tipo Despesa: " + form.getValue("tipoDespesa"));
		log.info("[Requisicao de Compra] [Validate Form]  Tipo Compra: " + form.getValue("tipoCompra"));
		log.info("[Requisicao de Compra] [Validate Form]  isBrasil: " + isBrasil);

		if(form.getValue("acaoRequisicao") == "criar" || form.getValue("acaoRequisicao") == "modificar"){
		
			if(isEmptyOrNull(form.getValue("companyCodeCB"))){
				throw(i18n.translate("alertaEmpresaBranco"));
			} 

			if(isEmptyOrNull(form.getValue("tipoDespesa"))){
				throw(i18n.translate("erroTipoDespesaBranco"));
			} 		
			
			if(isEmptyOrNull(form.getValue("codCentroCusto"))){
				// Nao validar para o Brasil E quando for Opex a Servicos
				if(isBrasil && form.getValue("tipoDespesa") == "Z"){
					log.info("[Requisicao de Compra] [Validate Form]  Validar Centro de Custo: false");
				}else{
					log.info("[Requisicao de Compra] [Validate Form]  Validar ");
					throw(i18n.translate("erroCentroCustoBranco"));					
				}
				
			}
			
			if(isEmptyOrNull(form.getValue("codOrdemInterna")) && form.getValue("tipoDespesa") != "K" && form.getValue("tipoDespesa") != "Z"){
				throw(i18n.translate("erroOrdemInternaBranco"));
			}
	
			if(isEmptyOrNull(form.getValue("codigoFornecedor")) && 
					(form.getValue("tipoCompra") == "CONDIC" || 
					form.getValue("tipoCompra") == "REGULAR" || 
					form.getValue("tipoCompra") == "DELEGADA")){
				throw(i18n.translate("erroCodigoFornecedorBranco"));
			}
			
			if(isEmptyOrNull(form.getValue("codigoServico")) && form.getValue("tipoDespesa") == "Z"){
				if(!isBrasil){
					throw(i18n.translate("erroCodigoServicoBranco"));
				} else if(isEmptyOrNull(form.getValue("codigoDocVendas"))){
					throw(i18n.translate("codDocVendas"));
				}
			}
			
			if(isEmptyOrNull(form.getValue("tipoCompra"))){
				throw(i18n.translate("erroTipoCompraBranco"));
			}
			
			if (isEmptyOrNull(form.getValue("tituloProcesso"))){
				throw(i18n.translate("erroTituloProcessoBranco"));
			}
			

			
			if(isEmptyOrNull(form.getValue("moeda"))){
				//Impacto da regra descrita em: Espec_Req_Requisições_Compras_V3.docx Página 8 - Seção 5.4 - Parágrafo 5º
				if (form.getValue("tipoCompra") != "RFI" && 
					form.getValue("tipoCompra") != "CATALOGO" && 
					form.getValue("tipoCompra") != "PRORROG"){
					throw(i18n.translate("erroMoedaBranco"));
				}
			} 
			
			if (isEmptyOrNull(form.getValue("obsRC"))){
				throw(i18n.translate("erroObsBranco"));
			}else{
				if (form.getValue("tipoCompra") != "PRORROG"){
					var indexes = form.getChildrenIndexes("rc_atento");
					for(var i = 0; i < indexes.length; i++){
						if(isEmptyOrNull(form.getValue("cdPlanta___" + indexes[i])) || isEmptyOrNull(form.getValue("planta___" + indexes[i]))){
							throw(i18n.translate("erroPlantaBranco"));
						}
						if(isEmptyOrNull(form.getValue("cdMaterial___" + indexes[i])) || isEmptyOrNull(form.getValue("material___" + indexes[i]))){
							throw(i18n.translate("erroMaterialBranco"));
						}
	
						if(isEmptyOrNull(form.getValue("quantidade___" + indexes[i]))){
							//Impacto da regra descrita em: Espec_Req_Requisições_Compras_V3.docx Página 8 - Seção 5.4 - Parágrafo 5º
							if (form.getValue("tipoCompra") != "RFI" && form.getValue("tipoCompra") != "CATALOGO" && form.getValue("tipoCompra") != "PRORROG"){
								throw(i18n.translate("erroQuantidadeBranco"));
							}
						}
						if(isEmptyOrNull(form.getValue("preco___" + indexes[i]))){
							//Impacto da regra descrita em: Espec_Req_Requisições_Compras_V3.docx Página 8 - Seção 5.4 - Parágrafo 5º 
							if (form.getValue("tipoCompra") != "RFI" && form.getValue("tipoCompra") != "CATALOGO" && form.getValue("tipoCompra") != "PRORROG"){
								throw(i18n.translate("erroPrecoBranco"));
							}
						}
						if(isEmptyOrNull(form.getValue("dtRemessa___" + indexes[i]))){
							throw(i18n.translate("erroDtRemessaBranco"));
						}
					}
				} else {
					if (isEmptyOrNull(form.getValue("numeroContrato"))){
						throw(i18n.translate("erroNumeroContratoBranco"));
					}
					if (isEmptyOrNull(form.getValue("dataInicio"))){
						throw(i18n.translate("erroDataInicioBranco"));
					}
					if (isEmptyOrNull(form.getValue("dataFim"))){
						throw(i18n.translate("erroDataFimBranco"));
					}
					if (isEmptyOrNull(form.getValue("fornecedorProrrogacao"))){
						throw(i18n.translate("erroFornecedorProrrogacao"));
					}
					
					if (isEmptyOrNull(form.getValue("optDataProrrogacao"))){
						throw(i18n.translate("erroDataProrrogacaoNaoSelecionada"));
					}
				}
			}
			
			if(form.getValue("acaoRequisicao") == "modificar"){
				if(form.getValue("requisicaoLiberada") == "false"){
					throw(i18n.translate("erroRequisicaoBloqueada"));
				}
			}
		}else if(form.getValue("acaoRequisicao") == "cancelar"){
			if(form.getValue("requisicaoLiberada") == "false"){
				throw(i18n.translate("erroRequisicaoBloqueada"));
			}

		}else if(form.getValue("acaoRequisicao") == "visualizar"){
			throw(i18n.translate("apenasVisualizando"));
		}else{
			throw(i18n.translate("erroAcaoEmBranco"));//Por favor, selecione a ação desejada antes de continuar
		}
	} else{
		if(ativ == atNumPedido && getValue("WKNextState") != atNumPedido && enviando){
			if(isEmptyOrNull(form.getValue("numPedidoGerado"))){
				throw(i18n.translate("campoNumPedidoGeradoBranco"));
			}else if(isEmptyOrNull(form.getValue("statusPedido"))){
				throw(i18n.translate("campoStatusPedidoBranco"));
			}else if(isEmptyOrNull(form.getValue("projetoAriba"))){
				throw(i18n.translate("comproProjetoAribaBranco"));
			}
		}

		if(ativ == atRegistrarSemIntegracao && getValue("WKNextState") != atRegistrarSemIntegracao && enviando){
			if(isEmptyOrNull(form.getValue("projetoAriba"))){
				throw(i18n.translate("comproProjetoAribaBranco"));
			}
		}
		
		if(getValue("WKCompletTask") == "true" && (ativ == atAprovarBudget || ativ == atAprovarGrupoMaterial || ativ == atAprovadores || ativ == atAprovarCapex)){
			// Valida preenchimento do campo Aprovar
			
			var indexes = form.getChildrenIndexes("rc_aprovadores");

			for(var i = 0; i < indexes.length; i++){
				
				var rdOptAProvar = form.getValue("optAProvar___" + indexes[i]);
				
				if (isEmptyOrNull(rdOptAProvar)){
					throw(i18n.translate("erroCampoAprovar"));
				}
					
				if (rdOptAProvar == "nao"){
					if(isEmptyOrNull(form.getValue("justificativa"))){
						throw(i18n.translate("erroCampoJustificavaReprovacao"));
					}
				}
			}		
			
		}
	}

	if (ativ == atRetorno) {
		var tb_recebedorIndex = form.getChildrenIndexes("tb_recebedor");
		for(var i = 0; i<tb_recebedorIndex.length; i++){
			if(form.getValue("encerrar___"+tb_recebedorIndex[i]) != "S"){
				throw(i18n.translate("erroFormularioEncerrar"));
			}
		}		
	}
	
	if(ativ == atTriarRequisicao){
		if(isEmptyOrNull(form.getValue("codigoFornecedor")) && 
				(form.getValue("tipoCompra") == "REGULAR" || 
					form.getValue("tipoCompra") == "DELEGADA")){
			throw(i18n.translate("erroCodigoFornecedorBranco")); 
		}
	}
}

function isEmptyOrNull(valorCampo){
	
	if (valorCampo == null || valorCampo == undefined)
		return true

	if (valorCampo.trim() == "")
		return true
	
	return false
}