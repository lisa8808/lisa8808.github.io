
var BASE_IMAGES=[
{n:"鲲鹏920服务器架构图",t:"diag-server",kw:["鲲鹏920","服务器","ARM","国产化"],d:"本图为鲲鹏920服务器系统架构图，展示基于ARM架构的国产化服务器整体设计。包含CPU核心、内存子系统、IO接口、网络模块和存储控制器五大模块。CPU采用鲲鹏920处理器，支持64核2.6GHz，配备8通道DDR4内存。"},
{n:"数据中心网络拓扑",t:"diag-network",kw:["数据中心","Spine-Leaf","交换机","高可用"],d:"本图为数据中心Spine-Leaf网络拓扑架构图。Spine层部署4台核心交换机，Leaf层部署12台接入交换机，全互联确保通信路径不超过2跳。出口部署双防火墙做HA高可用。"},
{n:"AI算力平台技术架构",t:"diag-arch",kw:["AI平台","算力","K8s","微服务"],d:"本图为AI算力平台总体技术架构图，采用云原生分层设计。基础设施层基于鲲鹏服务器集群和Kubernetes容器编排；平台层提供模型训练、推理服务、数据标注三大核心能力。"},
{n:"项目实施流程图",t:"diag-flow",kw:["项目管理","流程","里程碑","交付"],d:"本图展示项目从启动到验收的完整实施周期。主要阶段包括：需求调研（2周）、方案设计（3周）、开发实施（8周）、测试验收（2周）、上线运维（持续）。"},
{n:"机房平面布局图",t:"diag-data",kw:["机房","冷热通道","供电","42U"],d:"机房面积320㎡，部署标准42U机柜48个分4排布置，冷热通道分离设计。供电系统采用2N冗余UPS，配置精密空调8台N+1冗余。"},
{n:"ISO27001资质证书",t:"diag-cert",kw:["ISO27001","信息安全","认证","有效期"],d:"ISO/IEC 27001信息安全管理体系认证证书。证书编号CN-2024-INFOSEC-88291，有效期2024年3月至2027年3月，覆盖信息系统设计、开发、运维。"},
{n:"供应链金融平台架构",t:"diag-arch",kw:["供应链金融","SaaS","区块链","保理"],d:"供应链金融服务平台技术架构图。核心模块包括：应收账款电子债权凭证开立、多级流转、保理融资对接和资产证券化服务。底层采用区块链技术。"},
{n:"网络安全等保拓扑",t:"diag-network",kw:["等保三级","安全域","防火墙","IDS"],d:"按等保2.0标准划分安全域：互联网域、DMZ域、核心业务域、数据域和管理域。各域间部署防火墙隔离，出口配置IPS和WAF。"},
{n:"智慧园区场景效果图",t:"diag-data",kw:["智慧园区","IoT","3D","可视化"],d:"智慧园区综合管理平台场景图。整合安防监控、能耗管理、停车管理、环境监测子系统，支持3D可视化和GIS地图双视图切换。"},
{n:"投标报价分项表",t:"diag-cert",kw:["投标报价","分项报价","设备清单","税率"],d:"投标分项报价表含8项设备：AI训练服务器（4台×285,000元）、推理服务器（8台×168,000元）、核心交换机（2台×95,000元）等。总计3,268,000元。"},
{n:"系统性能压测报告",t:"diag-flow",kw:["性能测试","压测","TPS","响应时间"],d:"性能压测报告：测试场景覆盖1000/2000/5000并发。TPS峰值3,850，平均响应86ms，95分位210ms，错误率0.02%。全部指标满足招标要求。"},
{n:"项目团队组织架构",t:"diag-arch",kw:["项目团队","组织架构","人员配置","PMP"],d:"项目团队组织架构图。项目总监下设项目经理1名，下辖技术实施组（5人）、测试验证组（2人）、运维保障组（2人）。关键岗位要求5年以上经验。"}];
var ASSET_OVERRIDES=[
{src:"./assets/gallery/01-server-rack.svg",n:"AI服务器整机架构图",d:"本图为AI服务器整机架构图，展示鲲鹏920计算节点、AI推理与训练节点、100GE交换模块、NVMe存储阵列、冗余电源与BMC管理模块的整体设计，适用于投标方案中的服务器配置说明。"},
{src:"./assets/gallery/02-datacenter-network.svg",n:"数据中心Spine-Leaf网络拓扑",d:"本图为数据中心Spine-Leaf网络拓扑图，包含4台核心交换机、12台接入交换机、双防火墙HA出口，以及计算、存储和AI三类资源池，体现低时延、无阻塞的数据中心网络设计。"},
{src:"./assets/gallery/13-ocr-bid-requirements.svg",n:"招标技术要求OCR识别页",kw:["OCR","招标文件","技术要求","国产化"],ocr:true,d:"OCR识别内容：1. 投标人应提供完整的算力平台总体架构、实施方案、运维方案和验收方案；2. 平台须支持不少于 100 个并发用户在线编辑，系统响应时间不高于 2 秒；3. 须支持中文分词、语义检索、向量检索和关键词检索混合召回；4. 须支持不少于 500 万份文档入库；5. 须支持 OCR 识别扫描件、图片、表格、印章和手写批注；6. OCR 整体识别准确率不低于 95%，表格结构还原准确率不低于 90%；7. 须支持国产化 CPU、操作系统、数据库和中间件；8. 须满足等级保护三级要求；9. 须提供 7×24 小时运维支持，故障响应不超过 30 分钟；10. 试运行期不少于 30 天，高危及以上漏洞须全部闭环。\n\n解析总结：本页为招标文件技术规格要求，核心门槛集中在并发能力、响应时间、OCR 准确率、国产化适配和等保三级。投标响应时需逐项对照，尤其关注带“*”的核心参数，任一负偏离可能导致无效投标。"},
{src:"./assets/gallery/04-project-gantt.svg",n:"项目实施进度计划图",d:"本图为项目实施进度计划图，展示需求调研、方案设计、开发实施、系统联调、测试验收和上线运维的完整周期，并标注关键里程碑与责任阶段。"},
{src:"./assets/gallery/05-machine-room-layout.svg",n:"机房冷热通道布局图",d:"本图为机房冷热通道布局图，机房面积320㎡，部署标准42U机柜48个，采用冷热通道分离、2N冗余UPS和N+1精密空调设计，适合用于机房建设方案说明。"},
{src:"./assets/gallery/14-ocr-response-matrix.svg",n:"技术参数响应偏差表OCR页",kw:["OCR","响应偏差","技术参数","表格识别"],ocr:true,d:"OCR识别内容：序号1，招标要求支持 100 并发编辑，投标响应支持 200 并发编辑，结论正偏离；序号2，要求响应时间≤2秒，实测1.2秒，正偏离；序号4，要求OCR准确率≥95%，响应97.6%，正偏离；序号5，要求表格还原准确率≥90%，响应94.2%，正偏离；序号9，要求训练服务器≥4台，响应配置6台，正偏离；序号10，要求每台8张加速卡，响应每台8张Atlas 800I，完全响应；序号13，要求互联带宽≥100GbE，响应200GbE无阻塞网络，正偏离；序号14，要求可用性≥99.99%，响应双活架构99.995%，正偏离；序号20，要求三年质保，响应五年原厂质保，正偏离。\n\n解析总结：本表共识别20项技术参数，其中完全响应9项、正偏离11项、负偏离0项。主要优势集中在并发能力、OCR识别精度、算力配置、网络带宽、可用性和质保周期，技术响应整体优于招标要求。"},
{src:"./assets/gallery/07-supply-chain-finance.svg",n:"供应链金融平台架构图",d:"本图为供应链金融服务平台架构图，包含应收账款电子债权凭证、多级流转、保理融资、资产证券化等核心业务，底层采用联盟链与智能合约实现存证溯源。"},
{src:"./assets/gallery/08-security-topology.svg",n:"网络安全等保三级拓扑图",d:"本图为按等保2.0三级标准设计的网络安全拓扑图，划分互联网域、DMZ域、核心业务域、数据域和管理域，并部署防火墙、IPS、WAF与数据库审计。"},
{src:"./assets/gallery/09-smart-campus.svg",n:"智慧园区三维场景效果图",d:"本图为智慧园区三维场景效果图，整合安防监控、能耗管理、停车管理、环境监测和3D可视化能力，支持楼宇、设备与事件统一建模。"},
{src:"./assets/gallery/15-ocr-scoring-criteria.svg",n:"综合评分办法OCR识别页",kw:["OCR","评分办法","商务评分","技术评分"],ocr:true,d:"OCR识别内容：投标报价30分，以有效最低价为基准价，每高1%扣0.5分；技术方案25分，评估架构完整性、先进性、可扩展性和安全性；产品功能20分，评估功能覆盖度、易用性、兼容性和国产化适配；实施方案10分，评估进度计划、组织保障、风险控制和验收方案；售后服务8分，评估响应时间、驻场人员、培训方案和巡检频次；企业业绩5分，近三年同类项目合同每项1分，最高5分；资质证书2分，要求ISO9001、ISO27001、CMMI3等有效证书。扣分规则包括：缺少总体架构图、网络拓扑图、安全架构图每项扣2分；未说明国产化适配路径最高扣5分；现场演示须完成标书生成、智能审查、图库OCR三个核心场景；实施方案缺少里程碑计划最高扣3分；售后响应超要求最高扣4分。\n\n解析总结：本评标办法满分100分，技术相关权重合计55分，高于商务报价30分，说明项目更重视技术能力和产品功能。投标准备应优先补齐架构图、国产化说明、现场演示脚本、里程碑计划和售后服务承诺，避免高频扣分项。"},
{src:"./assets/gallery/11-performance-report.svg",n:"系统性能压测报告图",d:"本图为系统性能压测报告图，覆盖1000、2000、5000并发场景，TPS峰值3850，平均响应86ms，95分位210ms，错误率0.02%。"},
{src:"./assets/gallery/12-team-organization.svg",n:"项目团队组织架构图",d:"本图为项目团队组织架构图，项目总监下设技术实施组、测试验证组和运维保障组，关键岗位要求5年以上经验并提供驻场支持。"}];
BASE_IMAGES=BASE_IMAGES.map(function(image,index){return Object.assign({},image,ASSET_OVERRIDES[index])});
var EXTRA_IMAGES=[
{src:"./assets/gallery/16-disaster-recovery.svg",n:"同城双活容灾架构图",t:"diag-network",kw:["容灾","双活","RPO","RTO"],d:"本图为同城双活容灾架构图，展示生产数据中心与灾备数据中心之间的同步复制、日志同步和心跳检测机制，RPO约为0，RTO不超过5分钟。"},
{src:"./assets/gallery/17-data-governance.svg",n:"数据治理与资产目录体系图",t:"diag-arch",kw:["数据治理","资产目录","数据质量","血缘追踪"],d:"本图为数据治理与资产目录体系图，覆盖结构化数据、非结构化数据、接口数据的统一接入、标准化治理、质量检核、血缘追踪和资产目录发布。"},
{src:"./assets/gallery/18-hybrid-cloud.svg",n:"混合云统一管理架构图",t:"diag-arch",kw:["混合云","统一管理","Kubernetes","跨云备份"],d:"本图为混合云统一管理架构图，包含本地数据中心、私有算力云和公有云，通过统一身份认证、监控告警、日志审计和成本分析实现跨云统一治理。"},
{src:"./assets/gallery/19-intelligent-review.svg",n:"智能审查处理流程图",t:"diag-flow",kw:["智能审查","要素抽取","规则匹配","风险评分"],d:"本图为智能审查处理流程图，展示文件解析、要素抽取、规则匹配、风险评分和报告生成的完整链路，并覆盖资质、商务、技术和格式四类审查场景。"},
{src:"./assets/gallery/20-knowledge-base.svg",n:"投标知识库检索架构图",t:"diag-arch",kw:["知识库","向量检索","语义召回","引用溯源"],d:"本图为投标知识库检索架构图，整合企业资质、历史标书、产品资料和项目案例，通过全文索引、向量索引、语义召回和引用溯源提升素材复用效率。"},
{src:"./assets/gallery/21-operation-monitor.svg",n:"运维监控大屏图",t:"diag-data",kw:["运维监控","告警","可用率","性能指标"],d:"本图为运维监控大屏图，展示CPU、内存、在线用户、请求趋势、严重告警、一般告警和健康节点等运行指标，体现平台7×24小时监控能力。"},
{src:"./assets/gallery/22-acceptance-checklist.svg",n:"项目验收检查表",t:"diag-cert",kw:["项目验收","检查表","交付物","质保期"],d:"本图为项目验收检查表，覆盖安装部署、功能验证、性能压测、安全测评、数据迁移、培训交付和文档交付七类验收项，验收结论为通过。"},
{src:"./assets/gallery/23-training-plan.svg",n:"项目培训实施计划图",t:"diag-flow",kw:["培训计划","管理员培训","业务培训","运维培训"],d:"本图为项目培训实施计划图，包含管理员、业务用户和运维人员三类培训，采用现场集中培训、录播课程、操作手册和常见问题库相结合的方式。"}];
function formatImageDescription(image){
if(image.d.indexOf("OCR识别内容：")>-1&&image.d.indexOf("解析总结：")>-1)return image.d;
return "OCR识别内容：标题："+image.n+"；关键词："+image.kw.join("、")+"；版面元素：图形、文字标注与数据说明。\n\n解析总结："+image.d}
BASE_IMAGES=BASE_IMAGES.concat(EXTRA_IMAGES);
BASE_IMAGES.forEach(function(image){image.d=formatImageDescription(image)});
BASE_IMAGES.forEach(function(image,index){image.id="seed-"+(index+1)});
var galleryTitle="图库详情";
var currentGalleryId=null;
var imageCount=0;
var GALLERY_BRIDGE=(typeof globalThis!=="undefined"&&globalThis.GalleryWorkbenchBridge)||null;
function updateStoredGalleryCount(count){if(GALLERY_BRIDGE&&typeof GALLERY_BRIDGE.setCount==="function")GALLERY_BRIDGE.setCount(currentGalleryId,count)}
function applyGalleryMeta(){document.title=galleryTitle+" - AI投标助手";var project=document.getElementById("brandProject");if(project)project.textContent=galleryTitle;var focusProject=document.getElementById("focusBrandProject");if(focusProject)focusProject.textContent=galleryTitle;var heading=document.getElementById("galleryTitle");if(heading)heading.textContent=galleryTitle}
function openGalleryDetail(item){if(!item)return;currentGalleryId=item.id;galleryTitle=String(item.title||"图库详情").trim().slice(0,30)||"图库详情";imageCount=Math.max(0,Math.min(60,Math.trunc(Number(item.count)||0)));IMAGES=buildDemoImages(imageCount);selIdx=0;fIdx=0;checkedIds=[];pvZ=1;pvX=0;pvY=0;focusZ=1;focusX=0;focusY=0;var search=document.getElementById("imgSearch");if(search)search.value="";var focusStageEl=document.getElementById("focusOverlay");if(focusStageEl)focusStageEl.classList.remove("open");applyGalleryMeta();renderGallery()}
function clearGalleryDetail(){currentGalleryId=null;galleryTitle="图库详情";IMAGES=[];selIdx=0;fIdx=0;checkedIds=[];applyGalleryMeta();renderGallery()}
window.galleryDetailOpen=openGalleryDetail;
window.galleryDetailClear=clearGalleryDetail;
function buildDemoImage(index){var base=BASE_IMAGES[index%BASE_IMAGES.length];var image=Object.assign({},base);image.kw=base.kw.slice();if(index>=BASE_IMAGES.length)image.n=base.n+"（"+(Math.floor(index/BASE_IMAGES.length)+1)+"）";return image}
function buildDemoImages(count){return Array.from({length:count},function(_,index){return buildDemoImage(index)})}
var IMAGES=buildDemoImages(imageCount);
var selIdx=0,viewMode="grid",pvZ=1,pvX=0,pvY=0,fIdx=0,focusZ=1,focusX=0,focusY=0,checkedIds=[];
function escapeAttr(value){return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function imageMarkup(image){if(image&&image.src)return '<img src="'+image.src+'" alt="'+escapeAttr(image.n)+'">';return dsvg(image&&image.t)}
function dsvg(t){var c={server:"#3b82f6",network:"#22c55e",arch:"#eab308",flow:"#ec4899",data:"#06b6d4",cert:"#f97316"}[t.replace("diag-","")]||"#3b82f6";var i="";
if(t==="diag-server")i='<rect x="20" y="15" width="80" height="60" rx="4"/><path d="M30 25h60M30 35h60M30 45h60M30 55h60"/><circle cx="35" cy="65" r="3"/><circle cx="45" cy="65" r="3"/>';
if(t==="diag-network")i='<circle cx="60" cy="20" r="6"/><circle cx="30" cy="50" r="6"/><circle cx="60" cy="50" r="6"/><circle cx="90" cy="50" r="6"/><circle cx="45" cy="75" r="5"/><circle cx="75" cy="75" r="5"/><path d="M60 26 30 44M60 26v18M60 26l30 18M30 56l15 14M60 56l-15 14M60 56l15 14"/>';
if(t==="diag-arch")i='<rect x="15" y="10" width="90" height="18" rx="3"/><rect x="15" y="36" width="90" height="18" rx="3"/><rect x="15" y="62" width="90" height="18" rx="3"/><path d="M60 28v8M60 54v8M30 19h10M50 19h10M70 19h10M40 45h12M68 45h12"/>';
if(t==="diag-flow")i='<rect x="10" y="20" width="20" height="14" rx="3"/><rect x="40" y="20" width="20" height="14" rx="3"/><rect x="70" y="20" width="20" height="14" rx="3"/><rect x="40" y="50" width="20" height="14" rx="3"/><path d="M30 27h10M60 27h10M50 34v16M20 34v24h20"/>';
if(t==="diag-data")i='<rect x="20" y="15" width="35" height="25" rx="3"/><rect x="65" y="15" width="35" height="25" rx="3"/><rect x="20" y="50" width="35" height="25" rx="3"/><rect x="65" y="50" width="35" height="25" rx="3"/><path d="M37 40v10M82 40v10"/>';
if(t==="diag-cert")i='<rect x="25" y="15" width="70" height="55" rx="4"/><path d="M35 30h50M35 40h50M35 50h30"/><circle cx="80" cy="58" r="8"/><path d="m76 58 3 3 5-6"/>';
return '<svg class="diagram" viewBox="0 0 120 90" fill="none" stroke="'+c+'" stroke-width="1.5">'+i+'</svg>'}
function updateGalleryMeta(){var count=IMAGES.length;document.getElementById("galleryCount").textContent=count+" 张";var batchBtn=document.getElementById("batchBtn");batchBtn.disabled=checkedIds.length===0;batchBtn.className="btn "+(checkedIds.length?"btn-primary":"btn-outline");batchBtn.textContent="批量删除"+(checkedIds.length?"（"+checkedIds.length+"）":"");document.getElementById("selectAllBtn").textContent=checkedIds.length===count&&count?"取消全选":"全选";document.getElementById("focusModeBtn").disabled=!count;document.getElementById("analysisPreviewBtn").disabled=!count}
function renderGallery(){var el=document.getElementById("galleryContent");var empty=document.getElementById("galleryEmpty");empty.hidden=IMAGES.length>0;
if(!IMAGES.length){el.innerHTML="";updateGalleryMeta();return}
if(viewMode==="grid"){el.innerHTML='<div class="image-grid">'+IMAGES.map(function(img,i){var state=(i===selIdx?' active':'')+(checkedIds.includes(img.id)?' checked':'');
return '<div class="image-card'+state+'" onclick="selImg('+i+')"><div class="image-check" onclick="event.stopPropagation();toggleCheck('+i+')" role="checkbox" aria-checked="'+(checkedIds.includes(img.id)?'true':'false')+'"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L19 7"/></svg></div><div class="image-thumb '+img.t+'" ondblclick="event.stopPropagation();openPv('+i+')" title="双击预览原图">'+imageMarkup(img)+'</div><div class="image-overlay"><div class="image-actions"><button class="action-icon" onclick="event.stopPropagation();openPv('+i+')" title="预览"><svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="action-icon" onclick="event.stopPropagation();downloadImage('+i+')" title="下载"><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg></button><button class="action-icon danger" onclick="event.stopPropagation();delImg('+i+')" title="删除"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7"/></svg></button></div></div><div class="image-meta"><div class="image-name">'+img.n+'</div><div class="image-tags">'+img.kw.slice(0,2).map(function(k){return '<span class="tag">'+k+'</span>'}).join("")+(img.kw.length>2?'<span class="tag more">+'+(img.kw.length-2)+'</span>':'')+'</div></div></div>'}).join("")+'</div>';
}else{el.innerHTML='<div class="image-list">'+IMAGES.map(function(img,i){var state=(i===selIdx?' active':'')+(checkedIds.includes(img.id)?' checked':'');
return '<div class="list-item'+state+'" onclick="selImg('+i+')"><div class="list-check" onclick="event.stopPropagation();toggleCheck('+i+')" role="checkbox" aria-checked="'+(checkedIds.includes(img.id)?'true':'false')+'"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L19 7"/></svg></div><div class="list-thumb '+img.t+'" ondblclick="event.stopPropagation();openPv('+i+')" title="双击预览原图">'+imageMarkup(img)+'</div><div class="list-info"><div class="list-name">'+img.n+'</div><div class="list-keywords">'+img.kw.slice(0,4).map(function(k){return '<span class="list-kw">'+k+'</span>'}).join("")+'</div></div><div class="list-desc">'+img.d.slice(0,80)+'...</div><div class="list-actions"><button class="action-icon" onclick="event.stopPropagation();openPv('+i+')" title="预览"><svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="action-icon" onclick="event.stopPropagation();downloadImage('+i+')" title="下载"><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg></button><button class="action-icon danger" onclick="event.stopPropagation();delImg('+i+')" title="删除"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7"/></svg></button></div></div>'}).join("")+'</div>'}
updateAi();updateGalleryMeta()}
function selImg(i){selIdx=i;renderGallery()}
function toggleCheck(i){var id=IMAGES[i]&&IMAGES[i].id;if(!id)return;checkedIds=checkedIds.includes(id)?checkedIds.filter(function(item){return item!==id}):checkedIds.concat(id);renderGallery()}
function deleteImages(ids){var set=new Set(ids);IMAGES=IMAGES.filter(function(img){return !set.has(img.id)});checkedIds=[];if(selIdx>=IMAGES.length)selIdx=Math.max(0,IMAGES.length-1);updateStoredGalleryCount(IMAGES.length)}
function delImg(i){var image=IMAGES[i];if(!image)return;toast("已删除「"+image.n+"」");deleteImages([image.id]);renderGallery()}
function updateAi(){if(selIdx<0||!IMAGES[selIdx])return;var img=IMAGES[selIdx];document.getElementById("titleInput").value=img.n;document.getElementById("descInput").value=img.d;var kw=document.getElementById("keywordsWrap");kw.querySelectorAll(".kw-tag").forEach(function(t){t.remove()});var inp=kw.querySelector(".kw-add");img.kw.forEach(function(k){var tag=document.createElement("span");tag.className="kw-tag";tag.innerHTML=k+'<button onclick="rmKw(\''+k+'\')"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';kw.insertBefore(tag,inp)})}
function rmKw(k){IMAGES[selIdx].kw=IMAGES[selIdx].kw.filter(function(x){return x!==k});updateAi();renderGallery()}
document.getElementById("keywordsWrap").addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.classList.contains("kw-add")){var v=e.target.value.trim();if(v&&IMAGES[selIdx]&&!IMAGES[selIdx].kw.includes(v)){IMAGES[selIdx].kw.push(v);e.target.value="";updateAi();renderGallery()}}});
document.getElementById("gridViewBtn").onclick=function(){viewMode="grid";this.classList.add("active");document.getElementById("listViewBtn").classList.remove("active");renderGallery()};
document.getElementById("listViewBtn").onclick=function(){viewMode="list";this.classList.add("active");document.getElementById("gridViewBtn").classList.remove("active");renderGallery()};
var aiPanel=document.getElementById("aiPanel"),aiToggleBtn=document.getElementById("aiToggleBtn"),resizeHandle=document.getElementById("resizeHandle"),galleryPanel=document.getElementById("galleryPanel"),isCollapsed=false;
aiToggleBtn.onclick=function(){isCollapsed=!isCollapsed;aiPanel.classList.toggle("collapsed",isCollapsed);resizeHandle.style.display=isCollapsed?"none":"flex";galleryPanel.classList.toggle("full-width",isCollapsed);aiToggleBtn.title=isCollapsed?"展开解析面板":"收起解析面板"};
var isResizing=false,startX=0,startW=0;
resizeHandle.addEventListener("mousedown",function(e){isResizing=true;startX=e.clientX;startW=aiPanel.offsetWidth;resizeHandle.classList.add("dragging");document.body.style.cursor="col-resize";e.preventDefault()});
document.addEventListener("mousemove",function(e){if(!isResizing)return;var delta=startX-e.clientX;var w=Math.max(300,Math.min(700,startW+delta));aiPanel.style.width=w+"px"});
document.addEventListener("mouseup",function(){if(isResizing){isResizing=false;resizeHandle.classList.remove("dragging");document.body.style.cursor=""}});
var focusRight=document.getElementById("focusRight"),focusResizeHandle=document.getElementById("focusResizeHandle"),isFocusResizing=false,focusStartX=0,focusStartW=0;
focusResizeHandle.addEventListener("mousedown",function(e){isFocusResizing=true;focusStartX=e.clientX;focusStartW=focusRight.offsetWidth;focusResizeHandle.classList.add("dragging");document.body.style.cursor="col-resize";e.preventDefault()});
document.addEventListener("mousemove",function(e){if(!isFocusResizing)return;var delta=focusStartX-e.clientX;var width=Math.max(280,Math.min(620,focusStartW+delta));focusRight.style.width=width+"px"});
document.addEventListener("mouseup",function(){if(isFocusResizing){isFocusResizing=false;focusResizeHandle.classList.remove("dragging");document.body.style.cursor=""}});
var focusAiToggleBtn=document.getElementById("focusAiToggleBtn"),isFocusAiCollapsed=false;
focusAiToggleBtn.onclick=function(){isFocusAiCollapsed=!isFocusAiCollapsed;focusRight.classList.toggle("collapsed",isFocusAiCollapsed);focusResizeHandle.style.display=isFocusAiCollapsed?"none":"flex";focusAiToggleBtn.title=isFocusAiCollapsed?"展开解析面板":"收起解析面板"};
document.getElementById("focusModeBtn").onclick=function(){fIdx=selIdx;renderFocus();document.getElementById("focusOverlay").classList.add("open")};
document.getElementById("exitFocusBtn").onclick=function(){document.getElementById("focusOverlay").classList.remove("open");selIdx=fIdx;renderGallery()};
function renderFocus(){
if(fIdx<0||fIdx>=IMAGES.length)return;var img=IMAGES[fIdx];var st=document.getElementById("focusStage");st.className="stage-img "+img.t;st.innerHTML=imageMarkup(img);document.getElementById("focusTitle").textContent=img.n;document.getElementById("focusCounter").textContent=(fIdx+1)+" / "+IMAGES.length;document.getElementById("focusLabel").textContent=img.n;document.getElementById("fTitle").value=img.n;document.getElementById("fDesc").value=img.d;
focusZ=1;focusX=0;focusY=0;applyFocusTransform();
var kw=document.getElementById("fKw");kw.querySelectorAll(".kw-tag").forEach(function(t){t.remove()});var inp=kw.querySelector(".kw-add");img.kw.forEach(function(k){var tag=document.createElement("span");tag.className="kw-tag";tag.innerHTML=k+'<button onclick="fRmK(\''+k+'\')"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';kw.insertBefore(tag,inp)});
var thumbs=document.getElementById("focusThumbs");thumbs.innerHTML=IMAGES.map(function(im,i){return '<div class="focus-thumb '+im.t+(i===fIdx?' active':'')+'" onclick="fSel('+i+')">'+imageMarkup(im)+'<div class="focus-thumb-label">'+im.n+'</div></div>'}).join("");
var active=thumbs.querySelector(".focus-thumb.active");if(active){var target=active.offsetLeft-(thumbs.clientWidth-active.offsetWidth)/2;thumbs.scrollTo({left:Math.max(0,target),behavior:"smooth"})}}
function fSel(i){fIdx=i;renderFocus()}
function fNav(d){fIdx=(fIdx+d+IMAGES.length)%IMAGES.length;renderFocus()}
function fRmK(k){IMAGES[fIdx].kw=IMAGES[fIdx].kw.filter(function(x){return x!==k});renderFocus()}
document.getElementById("fTitle").addEventListener("input",function(event){var image=IMAGES[fIdx];if(!image)return;image.n=event.target.value.trim()||"未命名图片";document.getElementById("focusTitle").textContent=image.n;document.getElementById("focusLabel").textContent=image.n});
document.getElementById("focusCopyBtn").onclick=function(){var image=IMAGES[fIdx];if(!image)return;copyText(analysisText(image)).then(function(){toast("已复制图片解析信息")})};
document.getElementById("focusRegenBtn").onclick=function(){toast("AI正在重新解析...");setTimeout(function(){toast("重新解析完成");renderFocus()},1200)};
function applyFocusTransform(){var image=document.querySelector("#focusStage img");if(image)image.style.transform="translate("+focusX+"px, "+focusY+"px) scale("+focusZ+")";document.getElementById("focusStage").classList.toggle("zoomed",focusZ>1)}
function focusZoom(value){focusZ=Math.max(.5,Math.min(3,focusZ+value));if(focusZ<=1){focusX=0;focusY=0}applyFocusTransform()}
document.getElementById("fKw").addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.classList.contains("kw-add")){var v=e.target.value.trim();if(v){IMAGES[fIdx].kw.push(v);e.target.value="";renderFocus()}}});
document.getElementById("focusStage").addEventListener("wheel",function(event){if(!document.getElementById("focusOverlay").classList.contains("open"))return;event.preventDefault();focusZoom(event.deltaY<0?.1:-.1)},{passive:false});
var focusDragging=false,focusDragStartX=0,focusDragStartY=0,focusDragOriginX=0,focusDragOriginY=0;
document.getElementById("focusStage").addEventListener("mousedown",function(event){if(event.button!==0||focusZ<=1)return;focusDragging=true;focusDragStartX=event.clientX;focusDragStartY=event.clientY;focusDragOriginX=focusX;focusDragOriginY=focusY;this.classList.add("dragging");event.preventDefault()});
document.addEventListener("mousemove",function(event){if(!focusDragging)return;focusX=focusDragOriginX+event.clientX-focusDragStartX;focusY=focusDragOriginY+event.clientY-focusDragStartY;applyFocusTransform()});
document.addEventListener("mouseup",function(){if(focusDragging){focusDragging=false;document.getElementById("focusStage").classList.remove("dragging")}});
function applyPvTransform(){var image=document.querySelector("#previewImg img");if(image)image.style.transform="translate("+pvX+"px, "+pvY+"px) scale("+pvZ+")";document.getElementById("previewZoomInBtn").disabled=pvZ>=3;document.getElementById("previewZoomOutBtn").disabled=pvZ<=.5}
function openPv(i){selIdx=i;var img=IMAGES[i];var m=document.getElementById("previewModal");var p=document.getElementById("previewImg");p.className="image-thumb "+img.t;p.innerHTML=imageMarkup(img);p.style.transform="";pvZ=1;pvX=0;pvY=0;applyPvTransform();m.classList.add("open")}
function closePv(){document.getElementById("previewModal").classList.remove("open")}
function pvNav(d){selIdx=(selIdx+d+IMAGES.length)%IMAGES.length;openPv(selIdx)}
function pvZoom(v){pvZ=Math.max(.5,Math.min(3,pvZ+v));applyPvTransform()}
document.getElementById("previewModal").addEventListener("wheel",function(event){if(!this.classList.contains("open"))return;event.preventDefault();pvZoom(event.deltaY<0?.1:-.1)},{passive:false});
var pvDragging=false,pvDragStartX=0,pvDragStartY=0,pvDragOriginX=0,pvDragOriginY=0;
document.getElementById("previewImg").addEventListener("mousedown",function(event){if(event.button!==0||pvZ<=1)return;pvDragging=true;pvDragStartX=event.clientX;pvDragStartY=event.clientY;pvDragOriginX=pvX;pvDragOriginY=pvY;event.preventDefault()});
document.addEventListener("mousemove",function(event){if(!pvDragging)return;pvX=pvDragOriginX+event.clientX-pvDragStartX;pvY=pvDragOriginY+event.clientY-pvDragStartY;applyPvTransform()});
document.addEventListener("mouseup",function(){pvDragging=false});
var uploadModal=document.getElementById("uploadModal"),uploadDropzone=document.getElementById("uploadDropzone"),uploadInput=document.getElementById("uploadInput"),uploadFileList=document.getElementById("uploadFileList"),uploadError=document.getElementById("uploadError"),confirmUpload=document.getElementById("confirmUpload"),cancelUpload=document.getElementById("cancelUpload"),pendingUploads=[];
function resetUploadState(revoke){if(revoke)pendingUploads.forEach(function(pending){URL.revokeObjectURL(pending.url)});pendingUploads=[];uploadFileList.innerHTML="";uploadInput.value="";uploadError.textContent="";confirmUpload.disabled=true;confirmUpload.textContent="确认上传"}
function openUpload(){resetUploadState(true);uploadModal.classList.add("open")}
function closeUpload(){uploadModal.classList.remove("open");resetUploadState(true)}
function formatSize(size){if(size<1024)return size+"B";if(size<1024*1024)return (size/1024).toFixed(1)+"KB";return (size/1024/1024).toFixed(1)+"MB"}
function titleFromFilename(name){return String(name||"").replace(/\.[^.]+$/,"").replace(/[-_]+/g," ").trim()||"未命名图片"}
function keywordsFromTitle(title){var words=title.split(/[\s,，、/|]+/).filter(Boolean);return Array.from(new Set(words.concat(["本地上传","AI解析"])))}
function renderPendingUploads(){uploadFileList.innerHTML=pendingUploads.map(function(pending,index){return '<div class="upload-file"><img src="'+pending.url+'" alt=""><span class="upload-file-info"><span class="upload-file-name">'+pending.file.name+'</span><span class="upload-file-size">'+formatSize(pending.file.size)+'</span></span><button class="upload-remove" type="button" onclick="removePendingUpload('+index+')"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>'}).join("");confirmUpload.disabled=!pendingUploads.length}
function addUploadFiles(files){var invalid=[];Array.from(files||[]).forEach(function(file){if(!file.type||!file.type.startsWith("image/")){invalid.push(file.name+"：格式不支持");return}if(file.size>10*1024*1024){invalid.push(file.name+"：超过 10MB");return}pendingUploads.push({file:file,url:URL.createObjectURL(file)})});uploadError.textContent=invalid.join("；");renderPendingUploads()}
function removePendingUpload(index){var pending=pendingUploads[index];if(!pending)return;URL.revokeObjectURL(pending.url);pendingUploads.splice(index,1);renderPendingUploads()}
function loadImageInfo(url){return new Promise(function(resolve){var image=new Image();image.onload=function(){resolve({width:image.naturalWidth,height:image.naturalHeight})};image.onerror=function(){resolve({width:0,height:0})};image.src=url})}
function buildUploadImage(pending,info){var title=titleFromFilename(pending.file.name);var keywords=keywordsFromTitle(title);var summary="本图为「"+title+"」，来自本地上传。AI 已完成主体识别与关键词抽取。";return{id:"upload-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),n:title,t:"uploaded",src:pending.url,kw:keywords,d:"OCR识别内容：文件名："+pending.file.name+"；关键词："+keywords.join("、")+"；图像属性：格式 "+(pending.file.type||"图片")+"，分辨率 "+info.width+"×"+info.height+"，大小约 "+formatSize(pending.file.size)+"。\n\n解析总结："+summary,fileName:pending.file.name}}
async function confirmUploadImages(){if(!pendingUploads.length)return;confirmUpload.disabled=true;confirmUpload.textContent="AI解析中...";var uploads=[];for(var i=0;i<pendingUploads.length;i++){var info=await loadImageInfo(pendingUploads[i].url);uploads.push(buildUploadImage(pendingUploads[i],info))}IMAGES.push.apply(IMAGES,uploads);selIdx=Math.max(0,IMAGES.length-uploads.length);pendingUploads=[];resetUploadState(false);uploadModal.classList.remove("open");updateStoredGalleryCount(IMAGES.length);renderGallery();toast("图片上传成功，AI正在解析...");setTimeout(function(){toast("AI解析完成：已自动提取标题、关键词、描述")},1500)}
document.getElementById("uploadBtn").onclick=openUpload;
document.getElementById("emptyUploadBtn").onclick=openUpload;
cancelUpload.onclick=closeUpload;
confirmUpload.onclick=confirmUploadImages;
uploadDropzone.onclick=function(){uploadInput.click()};
uploadInput.onchange=function(event){addUploadFiles(event.target.files);uploadInput.value=""};
uploadDropzone.addEventListener("dragover",function(event){event.preventDefault();uploadDropzone.classList.add("dragover")});
uploadDropzone.addEventListener("dragleave",function(){uploadDropzone.classList.remove("dragover")});
uploadDropzone.addEventListener("drop",function(event){event.preventDefault();uploadDropzone.classList.remove("dragover");addUploadFiles(event.dataTransfer.files)});
document.getElementById("selectAllBtn").onclick=function(){if(!IMAGES.length)return;var allSelected=checkedIds.length===IMAGES.length;checkedIds=allSelected?[]:IMAGES.map(function(img){return img.id});renderGallery();toast(allSelected?"已取消全选":"已全选 "+IMAGES.length+" 张图片")};
document.getElementById("batchBtn").onclick=function(){if(!checkedIds.length)return;var count=checkedIds.length;var ids=checkedIds.slice();deleteImages(ids);renderGallery();toast("已批量删除 "+count+" 张图片")};
function syncActiveTitle(){var cards=document.querySelectorAll(".image-card,.list-item");cards.forEach(function(card,index){if(index!==selIdx)return;var name=card.querySelector(".image-name,.list-name");if(name)name.textContent=IMAGES[selIdx].n})}
document.getElementById("titleInput").addEventListener("input",function(event){var image=IMAGES[selIdx];if(!image)return;image.n=event.target.value.trim()||"未命名图片";syncActiveTitle()});
function analysisText(image){return "标题："+image.n+"\n关键词："+image.kw.join("、")+"\n图片描述："+image.d}
function copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);var textarea=document.createElement("textarea");textarea.value=text;textarea.style.position="fixed";textarea.style.opacity="0";document.body.appendChild(textarea);textarea.select();document.execCommand("copy");textarea.remove();return Promise.resolve()}
async function copyAnalysis(){var image=IMAGES[selIdx];if(!image)return;await copyText(analysisText(image));toast("已复制图片解析信息")}
document.getElementById("copyBtn").onclick=copyAnalysis;
function downloadImage(i){var image=IMAGES[i];if(!image)return;var extension=image.fileName?"."+image.fileName.split(".").pop():".svg";var link=document.createElement("a");link.href=image.src;link.download=image.n+extension;document.body.appendChild(link);link.click();link.remove();toast("已下载「"+image.n+"」")}
document.getElementById("regenBtn").onclick=function(){toast("AI正在重新解析...");setTimeout(function(){toast("重新解析完成")},1200)};
document.getElementById("analysisPreviewBtn").onclick=function(){openPv(selIdx)};
document.getElementById("imgSearch").addEventListener("input",function(e){var q=e.target.value.trim().toLowerCase();var items=document.querySelectorAll(".image-card,.list-item");items.forEach(function(item,idx){if(!IMAGES[idx])return;var img=IMAGES[idx];var m=!q||img.n.toLowerCase().includes(q)||img.kw.some(function(k){return k.toLowerCase().includes(q)});item.style.display=m?"":"none"})});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closePv();closeUpload();document.getElementById("focusOverlay").classList.remove("open")}if(document.getElementById("focusOverlay").classList.contains("open")){if(e.key==="ArrowLeft")fNav(-1);if(e.key==="ArrowRight")fNav(1)}});
function toast(msg){if(typeof window.galleryWorkbenchToast==="function"){window.galleryWorkbenchToast(msg);return}var t=document.getElementById("toast");if(!t)return;t.textContent=msg;t.hidden=false;clearTimeout(window.__galleryToastTimer);window.__galleryToastTimer=setTimeout(function(){t.hidden=true},2200)}
document.getElementById("emptyUploadBtn").onclick=function(){document.getElementById("uploadModal").classList.add("open")};
renderGallery();

