import { useState, useRef, useEffect } from 'react';
import './index.scss';

import QueryControls from './query-controls';
import QuerySelectors from './query-selectors';
import Editor from './editor';
import JsonViewer from 'react-json-view'

function QueryExplorer() {
  const [code, setCode] = useState("")
  const queries = [
    "/demo/httpbin-get/1",
    "/demo/httpbin-get/2",
    "/demo/httpbin-get/3",
    "/demo/demo-product/1",
    "/demo/demo-offer/1",
    "/demo/demo-sku/1",
  ]
  const tenants = [
    "ACOM-PF",
    "ACOM-NPF",
    "SUBA-NPF",
  ]

  const json = `
  {
    "cart": {
        "details": {
            "status": 200,
            "success": true,
            "metadata": {
                "ignore-errors": "ignore"
            }
        },
        "result": {
            "ameFlow": false,
            "b2b": false,
            "creditCardCashback": 0,
            "customer": {
                "guest": false,
                "id": "02-93890899-1",
                "isGuest": false,
                "oauth": false
            },
            "id": "c67f2fcc-3158-42de-a1fa-792dd9861edd",
            "lastModified": "Fri Feb 12 15:32:07 BRT 2021",
            "lines": [
                {
                    "condition": "NEW",
                    "crossborder": false,
                    "discount": {
                        "rate": 10,
                        "value": 15
                    },
                    "id": "122606094",
                    "insertDate": "Fri Feb 12 15:32:07 BRT 2021",
                    "maxQuantity": 12,
                    "maximumQuantityReason": "LOCK",
                    "offerId": "5fc654a4762ff367194645a6",
                    "peculiarity": "NEW",
                    "pricing": {
                        "from": 149.99,
                        "to": 134.99
                    },
                    "pricingId": "602144874b7c9b0015a4dd54",
                    "product": {
                        "class": "30000049",
                        "currencyOriginalPrice": 0,
                        "department": "10000058",
                        "diffs": [],
                        "dimension": {
                            "cubicWeight": 5.6511,
                            "dimensionWarning": false,
                            "height": 0.21,
                            "length": 0.23,
                            "weight": 2.17,
                            "width": 0.39
                        },
                        "groups": [
                            "298601",
                            "298610",
                            "298718",
                            "298817"
                        ],
                        "id": "122606086",
                        "image": "https://images-americanas.b2w.io/produtos/01/00/sku/122606/0/122606094G1.jpg",
                        "isKit": false,
                        "isLarge": false,
                        "isVirtual": false,
                        "line": "20000049",
                        "listPrice": 149.99,
                        "merchandiseHierarchy": {
                            "classe": "30000049",
                            "department": "10000058",
                            "line": "20000049",
                            "subclasse": "40000147"
                        },
                        "name": "Panela de Pressão 4,5L 20 cm Vancouver Grená",
                        "originalPrice": 149.99,
                        "preSale": false,
                        "price": 149.99,
                        "prime": false,
                        "productType": "PHYSICAL",
                        "quantity": 1,
                        "salesPrice": 149.99,
                        "sku": "122606094",
                        "subClass": "40000147",
                        "supplier": "Tramontina",
                        "tags": [
                            "blacknight-fevereiro2021",
                            "amais-in-fev",
                            "audiencia-casa",
                            "tag-45vancouver",
                            "desconto-saldao-geral-ud-out-",
                            "tag-acom-avista-push-udecameba",
                            "acom-appfretegratisud",
                            "selecao-panelas-saldao-acom-out",
                            "acom-cupompushud",
                            "acom-apostasudbase",
                            "tag-cupomapp-0110",
                            "cj-panela-ud-nov-prebf",
                            "acom-vancouverpp",
                            "acom-ud1p-pressao",
                            "tag-redfriday-2020-2",
                            "tag_udcamebaportateis-junho",
                            "tag-frete-mar19",
                            "sl-excecdescinfo-acom",
                            "acom-udcmbbf-1902",
                            "ameate20-bf",
                            "acom-udcmbbf-1901",
                            "acom-ud04",
                            "camisa10_aquisicao",
                            "tag-saldao-19-outubro",
                            "acom-udemailmkt",
                            "acom-ud-bn09",
                            "tag-1p-esquenta10",
                            "push_geo_cev",
                            "acom-udpanelas",
                            "acom-homeudcmblasasfs",
                            "acom-bf19-1pboleto",
                            "empresas-tag-bareserestaurantes-1302",
                            "tag_camisa10_bf_19_ema",
                            "vitrine-blacknight",
                            "acom-paispnlhhome",
                            "acom-ud111",
                            "tag-frete-sul-mai19-desk-50",
                            "slca-maisvendidossite-24x-0420",
                            "turim-oferta-afiliados-semana",
                            "amais-day-vitrine",
                            "panelas-ud-blast-acom-",
                            "americanas-e10-outubro",
                            "estrela-outubrooff",
                            "selecao-panelas-out-semana-quize",
                            "tag-banner-acom-saldao-ud-out",
                            "acom-sellersavistaout",
                            "acom-niverudutensilios",
                            "tag_aniversariudlasa",
                            "prime-aniver-csbk-05-estrela10",
                            "acom-niverudpanelas",
                            "vancouver-antecipada-acom-bf-nov",
                            "acom-panelasjantarcond8",
                            "acom-panelasprebf",
                            "slca-outubro-499",
                            "acom-niverudafiliados",
                            "tag-frete-sudeste-mar19",
                            "selecao-panela-avistadez-acom",
                            "push_clima_portateis_ud_0409",
                            "tag-vancouver-grena-odh",
                            "clientes_aquisicao_v1",
                            "acom-cozinhacompud",
                            "acom-ppudset",
                            "acom-panelasudset",
                            "tag-panelas-descontoa-ivista",
                            "acom-cozinhanovud",
                            "bannerpresente_o2o",
                            "natal_todos_1412",
                            "estrela-saldaonatal2020",
                            "tag_pag_pnlh",
                            "ud_14_12",
                            "botaovermelho_excecao",
                            "empresas-tag-ud-natal-2411",
                            "acom-boost-nov-ud",
                            "empresas-tag-revenda-natal-2411",
                            "tag-excebfud3p",
                            "acom-push-fev-panelas-ud",
                            "panelas-push-ud-dez",
                            "selecao-aluminio-acom-email",
                            "tag-exceto-1p-dez20",
                            "presentesnatal_npl_2020",
                            "novatagsaldao",
                            "tag-banner-liqui-ud-jan",
                            "listadenatal_o2o_2020",
                            "ud-email-1608",
                            "tag-frete-sudeste-mar19-desk",
                            "slca-apostasud-aniver2019",
                            "acom-udemail1016",
                            "bannersaldao_pnlh1610",
                            "ameate20bf",
                            "tag-atalho-ud",
                            "fretegratis_1p_redfriday",
                            "slca-diacartaodez1920x",
                            "slca-ate24x-maes2020",
                            "casa_voce",
                            "acom-udvancouver45",
                            "blacknight-novembro2020",
                            "estrela-redfriday2020",
                            "acom-altivaudnov",
                            "acom-aposta-nov-ud",
                            "cozinha-completa-geral-ud-nov",
                            "pp-pressao-vancouver-acom-",
                            "fretegratis_sfs10",
                            "acom-blastcozorg",
                            "acom-saldaosellerout",
                            "exceçãoacomcef",
                            "tag-cozinha-completa-avistadez",
                            "empresas-tag-revenda-bf-2010",
                            "cupom-push-acom-segunda-out",
                            "acom-udcashbackjun",
                            "ame-selecaoliquida15",
                            "acom-udportbanner1",
                            "acom-ameud15",
                            "slca-agosto-ud",
                            "tag-exceudavista",
                            "tag-vancouver45acom",
                            "live2-rafa",
                            "clientes_aquisicao_top100",
                            "slca-odh3p-0308",
                            "jantar-geral-banner-ud-email",
                            "clientes_aquisicao_v2",
                            "acom-udppressao",
                            "encartecasa_lasa",
                            "catalogo_acasaesua",
                            "acom-apostaset",
                            "acom-ud-o2o-2020",
                            "tag-ud-push-saldao-urg",
                            "tag_hsaquisicao",
                            "tag-atalho-3h",
                            "tag-maisvendidos-acom-desconto",
                            "tag-panela-pressao-ud-acom",
                            "tag-udafiliados20ame",
                            "vancouver-quatrolitros-set-acom",
                            "tag-cashback-merchan-vancouverdez",
                            "volta30",
                            "tvlasa_19",
                            "am-e10-5off",
                            "acom-panelassetembro",
                            "acom-cashbackudset",
                            "acom-liquida-janeiro21ud",
                            "selecao-panelas-desconto-bf-ud",
                            "presente-natal-ud-blacknight-acom",
                            "tag-red-sortimento",
                            "acom-panelasnovud",
                            "acom-uddezembro",
                            "acom-temtudocameba",
                            "aniversarioacom-atalho",
                            "tag-temtudo-19-setembro",
                            "acom-peguenaloja",
                            "amedaycasa-acom",
                            "ameudportjul",
                            "acom_flash_0307",
                            "niver_acom_ud-afiliados",
                            "empresas-tag-descontosredfriday-2811",
                            "acom-ud020",
                            "tag-black-night-19-nov",
                            "aniveracom-apostas1p",
                            "tag-udecameba-19-julho",
                            "acom-udcmbsaldaonatal19",
                            "acom-1709ppemail15",
                            "acom-bf19-1pcartao-exc",
                            "slca-maes2020",
                            "tag_panelapressaovancouver",
                            "tag_ud_hot_precisa",
                            "empresas-callink",
                            "exceto1p-acom",
                            "panela-semanacliente-acom",
                            "acom-vancouver4-5l-app",
                            "amais-csbk-estrela10-5off",
                            "dpto21_27_10",
                            "acom_exc1107",
                            "ameselecaogeral",
                            "slca-aliquiabr19",
                            "tag-semanacasa-junho",
                            "tag-pegue-na-loja-mar19",
                            "tag-udsemanacasa05",
                            "slca-maes-finance",
                            "acom-udport2303",
                            "tag-liquida-19-abril",
                            "ganharbuybox_122606086",
                            "acom-udbanneremail1402",
                            "slca-semanacasamaio19",
                            "acom-udporthome1",
                            "acom-diadasmaes19",
                            "slca-maisbuscados15",
                            "ameliquidaate20tag",
                            "tag-dia-das-maes-2019",
                            "slca-lasa-tecnologia-jun20",
                            "acom-udexcecaobn09",
                            "bannerpnlh_saldao",
                            "push_geo_ldr",
                            "amefreq20",
                            "acom-saldaoudcmb090919",
                            "busca_aposta_0819_acom",
                            "novatag-vitrine-blacknight",
                            "acom-udcmb0110",
                            "push_geo_rcl",
                            "empresas-tag-apostasb2bbf1p",
                            "acom-udcmbbf19",
                            "tag_bfnovos",
                            "acom-semcasa04",
                            "tag-ud15ame",
                            "acom-udporthomesaldao05",
                            "tag-frete-sudeste-mai19-desk-50",
                            "slca-aposta20lasadez",
                            "tag-red-friday-19-nov",
                            "aliquidacao-jan",
                            "acom-cozinhaoutud",
                            "clientesame",
                            "camebaportoseguro",
                            "acom-vancouveracaosfs",
                            "slca-aniversario2020-lasa",
                            "acom-aniversarioud1",
                            "slca-aniver-lasa20",
                            "acom-paichef",
                            "tag-vancouver4,5",
                            "tag-campudcash",
                            "acom-casasaldaoset",
                            "acom-e10promo",
                            "acom-udbannerapp",
                            "tag-udportsemanacasa05",
                            "acom-udhome",
                            "acom-diadospaisUD",
                            "acom-diadospaisudportateis",
                            "slca-pais20-lasa",
                            "selecao-panelas-banner-blast-acom",
                            "tag-geral-ud-destaque-email",
                            "acom-panelasud20",
                            "tag-acao-cameba-desconto-",
                            "tag-casacompleta-trinta-desconto",
                            "cashbackdezacom-fds-set",
                            "semanadocliente-setembro",
                            "panela-geral-ud-desconto",
                            "empresas-tag-ud-2408",
                            "acom-semanacasaagosto2020",
                            "acom-saldaobrasilud",
                            "acom-cozinhaset20",
                            "acom-destaquecasaud",
                            "acom-udafiliadosago",
                            "vemcomprar",
                            "FRETE20_BF20_ACOMV2",
                            "acom-apostasrbudbf",
                            "acom-apostasudbf20",
                            "prime-aniver-csbk-05",
                            "prime-aniver-ud-csbk",
                            "tag_tudo20",
                            "e10-amais-cbk4",
                            "fretegratis_sfs_out",
                            "acom-panelasudout",
                            "recompra-mais20",
                            "acom-bannerudout",
                            "acom-udhomebanner",
                            "ud_frete",
                            "acom-panelasoutud",
                            "acom-ameoutud",
                            "tag-vancouver-odh-nov-acom",
                            "acom-ppressaoud3p",
                            "acom-pp-desconto-out",
                            "acom-lasapnlhud3p",
                            "empresas-br-distribuidora",
                            "jantar-panela-faqueir-nov",
                            "tag-exceefacilud",
                            "tag-acomudmesa15",
                            "topofertas_lasa_rf",
                            "tag-ud-afiliados10",
                            "acom-pp-25off-ud1p",
                            "exposicao-cupom-bf2020",
                            "tag_o2o_mg",
                            "empresas-tag-copa-0212",
                            "prebf-20201112080001-20201113090000",
                            "blackfriday_o2o_panela",
                            "FRETE20_BF20_ACOM",
                            "anonovo-2021",
                            "bbb_acao1",
                            "testevolta50",
                            "acasa",
                            "acom-bfpanelaspush",
                            "acom-itenscozvermelha",
                            "apostasnatal_suba_o2o",
                            "live-1712",
                            "acom-push-tudocozinha-ud",
                            "botaovermelho_0221",
                            "redfriday-top50",
                            "tag-anivermelhoresud",
                            "botaovermelho_acom",
                            "apostas-o2o-3h",
                            "tag-20ame-redfriday",
                            "tag-cupompanelas",
                            "semana-do-consumidor",
                            "vitrine_ud",
                            "presentes-peguenaloja",
                            "tag_push_tudoparacasa",
                            "acom-homecasaud",
                            "acom-aposta-jan21-ud",
                            "slca-semanacasajul19"
                        ],
                        "weight": 6.0749326
                    },
                    "productId": "122606086",
                    "productSku": "122606094",
                    "promotions": [
                        {
                            "category": "PURCHASE_CLUB",
                            "conditional": false,
                            "criteria": [
                                {
                                    "name": "CUSTOMER_TAG",
                                    "values": [
                                        "buyers-club"
                                    ]
                                }
                            ],
                            "discountValue": 15,
                            "name": "PURCHASE_CLUB"
                        }
                    ],
                    "quantity": 1,
                    "quantityLock": {
                        "b2b": 100,
                        "b2c": 12
                    },
                    "salesPrice": 134.99,
                    "type": "B2W",
                    "unitSalesPrice": 134.99
                }
            ],
            "maximumNumberOfLinesInCart": 10,
            "pickUpInStore": {
                "eligible": false
            },
            "salesChannel": "ACOM",
            "status": "NEW",
            "storeProperties": {
                "maxLines": 10,
                "minimumValue": 0,
                "missingValue": 0
            },
            "suggestedCoupons": {
                "next": []
            },
            "total": 134.99
        }
    },
    "services": {
        "details": [
            {
                "status": 200,
                "success": true,
                "metadata": {
                    "ignore-errors": "ignore"
                }
            }
        ],
        "result": [
            []
        ]
    }
}  
`;


  const containerRef = useRef(null)
  const selectorsRef = useRef(null)
  const resultsRef = useRef(null)

  const [availableHeight, setAvailableHeight] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)

  useEffect(() => {
    if (Boolean(containerRef.current) && Boolean(selectorsRef.current) && Boolean(resultsRef.current)) {
      const height = (containerRef.current as any).offsetHeight - (selectorsRef.current as any).offsetHeight
      const width = (containerRef.current as any).offsetWidth - (resultsRef.current as any).offsetWidth


      setAvailableHeight(height)
      setAvailableWidth(width)
    }
  }, [containerRef, selectorsRef])

  return (
    <>
      <div className="query-explorer__controls--wrapper">
        <QueryControls queries={queries} />
      </div>
      <div ref={containerRef} className="query-explorer__input-output--wrapper">
        <div className="query-inputs">
          <div ref={selectorsRef} className="query-inputs__selectors">
            <QuerySelectors tenants={tenants} />
          </div>
          <Editor 
            className="query-explorer__editor" 
            code={"from cart"} 
            height={availableHeight} 
            width={availableWidth}
            onChange={() => {}} 
          />
        </div>
        <div ref={resultsRef} className="query-explorer__result">
          <JsonViewer 
            name={null} 
            src={JSON.parse(json)} 
            iconStyle={"triangle"} 
            displayDataTypes={false} 
            enableClipboard={true}
          />
        </div>
      </div>
    </>
  )
}

export default QueryExplorer