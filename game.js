(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const saveKey = "last-shell-fadin-v1";
  const defaults = () => ({ ammo:12, tank:100, infantry:30, intel:0, trust:50, civilians:0, hours:0, road:false, position:"", shotPlane:false, route:[], node:"briefing" });
  let state = defaults();
  const scenes = {
    briefing: { chapter:"午夜命令", tag:"1944 年冬夜 · 村庄以东", title:"五小时", text:["雪落在T-34的炮塔上，像一层薄灰。上级的命令很短：夺取达舒科夫卡，在主力抵达前坚守。", "你身后有三十名步兵。前方的村庄没有灯，却有不止一门反坦克炮在等着。"], choices:[
      ["scout","派步兵侦察村口", "多花一点时间，换取敌军部署的情报。"], ["rush","沿公路全速突击", "以速度换取先手，承受被伏击的风险。"], ["cutoff","绕行村外，切断退路", "避开正面火力，但可能错过突袭时机。"]] },
    scout: { chapter:"夜色中的脚印", tag:"第 1 小时", title:"村口的炮", text:["侦察兵爬回雪沟，手套上全是泥：村口有两门反坦克炮，教堂钟楼里还有观察员。", "你得到了一张粗略草图，但敌人也开始不安地朝黑暗里开火。"], choices:[
      ["flank","从侧翼突入", "利用情报避开炮口，争取完整坦克。"], ["guns","先摧毁反坦克炮", "消耗炮弹，换取步兵更安全的通道。"], ["church","直取钟楼", "切断观察，但村口火炮仍在。"]] },
    rush: { chapter:"第一声炮响", tag:"第 1 小时", title:"公路上的火焰", text:["履带碾过冻土，炮口闪光从村口扑来。第一发擦过炮塔，第二发击中了履带护板。", "坦克没有停下，跟在车后的步兵却被迫散开。"], choices:[
      ["guns","顶着火力摧毁反坦克炮", "冒险消耗炮弹，清出村口。"], ["flank","冲入侧巷脱离公路", "坦克会受损，步兵可能失散。"], ["church","强攻钟楼", "敌军观察员会先报出你的位置。"]] },
    cutoff: { chapter:"雪原上的岔路", tag:"第 1 小时", title:"退路与入口", text:["你绕过村庄东侧，发现一条被雪埋住的运输路。敌军补给车刚刚驶过，显然还没料到你会在这里。", "但正面突击的时机正在流失。"], choices:[
      ["road","封锁运输路", "获得退路和伏击位置，村内守军会加强警戒。"], ["flank","立刻由东侧突入", "以局部奇袭换取村内立足点。"], ["church","先占领钟楼外的高地", "抢到视野，代价是给敌人时间。"]] },
    flank: { chapter:"进入村庄", tag:"第 2 小时", title:"黑暗中的十字路口", text:["坦克撞开木栅栏，越过侧巷。村中心的十字路口就在前方，那里能控制三条道路。", "无线电传来杂音：敌军正在从西面集结。"], choices:[
      ["crossroads","占领十字路口", "建立最稳固的防线。"], ["hq","搜索敌军指挥所", "寻找反攻计划与通信情报。"], ["cellar","先检查燃烧的民宅", "地窖中可能还有来不及撤离的人。"]] },
    guns: { chapter:"火炮阵地", tag:"第 2 小时", title:"必须命中的一炮", text:["敌方反坦克炮正在装填。炮手看向你，等待口令。", "这不是一次值得炫耀的射击，它只决定谁能活着进入村庄。"], choices:[
      ["crossroads","连续炮击，夺取十字路口", "炮弹减少，但阵地更干净。"], ["hq","摧毁火炮后搜索指挥所", "需要绕过废墟，可能错过防御时间。"], ["cellar","火炮压制后救援地窖", "把一部分时间交给陌生人。"]] },
    church: { chapter:"钟楼阴影", tag:"第 2 小时", title:"看得见的敌人", text:["钟楼里的观察员被清除后，村庄忽然变得安静。你能看清西面道路上的车辙，敌军装甲正在靠近。", "视野是优势，也是倒计时。"], choices:[
      ["crossroads","占领十字路口", "利用视野提前布置火力。"], ["hq","突入指挥所", "夺取敌军的反攻情报。"], ["cellar","绕去燃烧民宅", "伤员的呼救压过了引擎声。"]] },
    crossroads: { chapter:"第一次反攻", tag:"第 3 小时", title:"西面的履带声", text:["敌军步兵在雪雾中展开，一辆装甲车紧随其后。你已抢到十字路口，但防线还没有完全合拢。", "炮弹、步兵和时间，三样都不够。"], choices:[
      ["hold","优先击毁装甲车", "消耗炮弹，保护步兵防线。"], ["ambush","熄火埋伏，等它靠近", "有情报时成功率更高，失败会重创坦克。"], ["cellar","分出人手救援地窖", "村民或许知道一条村外小路。"]] },
    hq: { chapter:"桌上的地图", tag:"第 3 小时", title:"敌人的下一步", text:["指挥所的桌上压着一张标记完整的地图。敌军将从西路投入自行火炮，并预留了北侧包抄队。", "这不是胜利，只是让你能选一种更清醒的危险。"], choices:[
      ["ambush","在西路设伏", "以情报换取一次有效的近距离战斗。"], ["hold","回到十字路口组织火力", "稳住中心，但北侧包抄仍会到来。"], ["cellar","带地图去民宅救援", "情报在手，仍决定把时间给人。"]] },
    cellar: { chapter:"地窖", tag:"第 3 小时", title:"门后的呼救", text:["燃烧的屋梁下面，地窖门被杂物压住。里面有村民，也有一名受伤的孩子。你的步兵看向你，没有人说话。"], choices:[
      ["rescue","派人救援", "减少防线人手，但可能获得当地人的帮助。"], ["order","命令他们自行撤离", "尽量兼顾任务与风险。"], ["leave","封锁地窖，返回防线", "保留兵力，却留下无法消失的代价。"]] },
    hold: { chapter:"第二次反攻", tag:"第 4 小时", title:"钢铁与雪", text:["装甲车燃烧起来，步兵被迫卧倒。可远处的自行火炮已经架好炮管，而坦克的炮塔开始转动迟滞。", "主力还没有消息。你必须决定如何迎接最后一小时。"], choices:[
      ["laststand","留在十字路口，作为固定炮台", "以坦克换时间。"], ["move","转移到北侧巷口", "保持机动，但需要承受火炮追击。"], ["breakout","带步兵沿小路突围", "只有救援或侦察时获得道路信息才能可靠脱离。"]] },
    ambush: { chapter:"伏击", tag:"第 4 小时", title:"距离缩短", text:["引擎熄灭后，坦克像一块冻住的铁。敌车越来越近，你能听见履带压碎冰层。", "炮手的手停在拉绳旁。再近一点，或现在？"], choices:[
      ["laststand","近距离开火后固守", "赌一发炮弹和车组的配合。"], ["move","击发后转移", "以机动躲开敌方自行火炮。"], ["breakout","放弃阵地，沿小路突围", "需要足够的步兵和道路情报。"]] },
    rescue: { chapter:"一条小路", tag:"第 4 小时", title:"没有写在地图上的路", text:["村民拖出受伤的孩子，也指出一条通往村外的土路。它能用于撤退，也能让步兵绕到敌军侧后。", "与此同时，西面的爆炸声越来越近。"], choices:[
      ["laststand","让村民撤离，返回十字路口", "保留人性，也接受正面硬撑的代价。"], ["move","让步兵从小路迂回，坦克转移", "以村民提供的路改变战场。"], ["breakout","护送伤员从小路撤离", "保存更多生命，但放弃村庄。"]] },
    order: { chapter:"迟来的选择", tag:"第 4 小时", title:"半开的地窖门", text:["村民带着伤员从地窖出来，向你指了一条雪下土路。他们不再说话，只等着你的决定。"], choices:[
      ["laststand","回到十字路口", "守住任务目标。"], ["move","利用土路机动到北侧", "试图打乱敌军部署。"], ["breakout","护送村民突围", "用任务换取生还者。"]] },
    leave: { chapter:"封闭的门", tag:"第 4 小时", title:"代价没有声音", text:["地窖门在身后合上。你回到坦克旁，没人质问命令，但车组的沉默比炮火更重。"], choices:[
      ["laststand","固定炮台，坚守十字路口", "将全部力量押在任务上。"], ["move","转移至北侧巷口", "避开正面，但信任会决定执行力。"], ["breakout","命令步兵突围", "现在没有人知道哪条路安全。"]] },
    laststand: { chapter:"第五小时", tag:"黎明前", title:"最后三发", text:["炮塔转动得越来越慢。弹药架上只剩三发炮弹，西路的坦克与自行火炮同时出现。远方传来履带声，却无法分辨是援军还是敌军。"], choices:[
      ["signal","发射最后一发，作为信号", "赌援军能看见，也赌敌人来不及开火。"], ["armor","优先射击敌军坦克", "守住阵地，需要车组保持镇定。"], ["roadblock","轰塌道路两侧建筑", "用废墟封锁道路，代价是村庄。"]] },
    move: { chapter:"北侧巷口", tag:"黎明前", title:"转动困难的炮塔", text:["坦克钻进北侧巷口，履带每转一下都带着金属摩擦声。敌方自行火炮正在校准，而你占据了一个短暂的射击角。"], choices:[
      ["signal","用炮火制造烟柱求援", "暴露位置，换取被发现的机会。"], ["armor","近距离打掉自行火炮", "需要足够炮弹和精准情报。"], ["roadblock","击毁房屋形成路障", "失去机动，但拖慢敌军。"]] },
    breakout: { chapter:"村外雪原", tag:"黎明前", title:"带谁离开", text:["你决定离开村庄。伤员、步兵和车组都望着同一个方向：通向东面树林的白色小路。", "这不是怯懦的选择，但它会改变所有人的叙述。"], choices:[
      ["escape","带领所有幸存者撤离", "道路和村民信任决定成功率。"], ["rear","命令部队撤退，自己断后", "任务失败，但有人能活下去。"], ["return","掉头回到十字路口", "承认撤退太早，回到最危险的地方。"]] }
  };
  const endings = {
    true:{ type:"真实结局", title:"坚守五小时", text:"太阳升起时，东面的履带声终于属于主力部队。村庄守住了，坦克已经伤痕累累。报告会记下战果，但不会写尽那些没有回来的名字。" },
    last:{ type:"隐藏结局", title:"最后一发", text:"你把仅剩的炮弹留给了最后一辆敌方装甲车辆。它在十字路口前停下，援军抵达时，炮膛已空。后来人们为这最后一发赋予传奇，而你记得的是炮手发抖的手。" },
    guardian:{ type:"人道结局", title:"村庄的守护者", text:"村民和伤员都沿着小路离开了火线。你没能留下最耀眼的战果，却为一些人留下了继续生活的机会。多年后，他们仍记得那辆挡在路口的坦克。" },
    foot:{ type:"战术结局", title:"没有坦克的车长", text:"坦克最终停在巷口，但你带着步兵守住了道路。钢铁失去了行动力，人仍然可以成为防线。" },
    retreat:{ type:"撤离结局", title:"沉默的撤退", text:"幸存者穿过树林，身后的村庄重新落入敌军之手。任务失败的报告会很短，但那些走出来的人知道，你没有把他们当成可随时消耗的数字。" },
    cost:{ type:"苦涩结局", title:"代价过高", text:"阵地没有失守，可步兵和车组留下的空位太多。胜利被写进了记录，而你拒绝参加庆祝。" },
    fire:{ type:"失败结局", title:"燃烧的十字路口", text:"炮火淹没了最后的防线。你争取了时间，却没能等到援军。雪落在燃烧的履带上，村庄再次沉入黑暗。" },
    sky:{ type:"传闻结局", title:"天空中的火焰", text:"炮火与烟柱引来低空盘旋的敌机。它在混乱中坠向村外雪地。很多人后来不相信这段故事，直到有人找到了一块带编号的残骸。" }
  };
  function adjust(change) { Object.entries(change).forEach(([key,value]) => state[key] = Math.max(0, state[key] + value)); }
  function apply(choice) {
    state.route.push(choice); state.hours = Math.min(5, state.hours + (state.node === "briefing" ? 1 : 1));
    const effects = { scout:{intel:25,infantry:-1}, rush:{tank:-20,infantry:-4}, cutoff:{intel:15,road:true}, guns:{ammo:-3,intel:8}, flank:{tank:-8}, church:{intel:18,ammo:-1}, crossroads:{position:"crossroads",trust:5}, hq:{intel:25}, cellar:{trust:-5}, hold:{ammo:-3,infantry:-3}, ambush:{intel:10}, rescue:{civilians:1,infantry:-4,road:true,trust:16}, order:{civilians:1,infantry:-2,road:true,trust:5}, leave:{trust:-22}, laststand:{tank:-18}, move:{tank:-12}, breakout:{trust:-4}, signal:{ammo:-1}, armor:{ammo:-2}, roadblock:{ammo:-2,trust:-3}, escape:{}, rear:{infantry:-5}, return:{trust:7} };
    const effect = effects[choice] || {}; Object.entries(effect).forEach(([key,value]) => { if(key === "road") state.road = value; else if(key === "position") state.position = value; else adjust({[key]:value}); });
    if (choice === "ambush" && state.intel < 20) adjust({tank:-25,infantry:-4});
    if (choice === "armor" && state.intel >= 35) adjust({tank:5});
    if (choice === "return") { state.node = "laststand"; return; }
    if (["signal","armor","roadblock","escape","rear"].includes(choice)) { finish(choice); return; }
    state.node = choice;
    if (!scenes[state.node]) state.node = "flank";
    save(); render();
  }
  function finish(action) {
    let id = "fire";
    const survived = state.tank > 25 && state.infantry > 8;
    if (action === "escape") id = state.road && state.infantry >= 10 ? "retreat" : "fire";
    else if (action === "rear") id = state.infantry >= 8 ? "foot" : "fire";
    else if (action === "signal" && state.intel >= 40 && state.civilians > 0) id = "sky";
    else if (action === "armor" && state.ammo >= 1 && state.trust >= 45 && survived) id = state.ammo <= 3 ? "last" : "true";
    else if (action === "roadblock" && survived) id = state.civilians ? "guardian" : "cost";
    else if (state.position === "crossroads" && state.hours >= 5 && survived) id = state.civilians ? "guardian" : "true";
    else if (state.infantry >= 9 && state.trust >= 42) id = "foot";
    state.ending = id; localStorage.removeItem(saveKey); renderEnding();
  }
  function render() {
    const scene = scenes[state.node];
    $("chapter").textContent = scene.chapter; $("tag").textContent = scene.tag; $("title").textContent = scene.title;
    $("story").innerHTML = scene.text.map(t => `<p>${t}</p>`).join("");
    $("hint").textContent = state.intel >= 35 ? "你掌握了较完整的敌军动向。" : state.trust < 35 ? "车组的沉默正在影响命令执行。" : "每一个选择都会改变最后的防线。";
    $("choices").innerHTML = "";
    scene.choices.forEach(([id,title,detail],i) => { const b=document.createElement("button"); b.className="choice"; b.innerHTML=`<b>0${i+1}</b><div>${title}<span>${detail}</span></div>`; b.onclick=()=>apply(id); $("choices").appendChild(b); });
    [["ammo","ammo"],["tank","tank"],["infantry","infantry"],["intel","intel"],["trust","trust"]].forEach(([id,key]) => $(id).textContent = state[key]);
    $("hours").textContent = `${Math.min(state.hours,5)} / 5`; $("progressBar").style.width = `${Math.min(state.route.length,8)/8*100}%`;
  }
  function renderEnding() { const e=endings[state.ending]; $("game").hidden=true; $("intro").hidden=true; $("ending").hidden=false; $("endingType").textContent=e.type; $("endingTitle").textContent=e.title; $("endingText").textContent=e.text; $("summary").innerHTML=`<span>炮弹 ${state.ammo}</span><span>坦克 ${state.tank}</span><span>步兵 ${state.infantry}</span><span>情报 ${state.intel}</span><span>信任 ${state.trust}</span>`; }
  function start() { state=defaults(); $("intro").hidden=true; $("ending").hidden=true; $("game").hidden=false; render(); }
  function save(){ localStorage.setItem(saveKey,JSON.stringify(state)); }
  $("start").onclick=start; $("restartTop").onclick=start; $("restartEnd").onclick=start;
  try { const saved=JSON.parse(localStorage.getItem(saveKey)); if(saved && saved.node && scenes[saved.node]) state=saved; } catch { localStorage.removeItem(saveKey); }
})();

