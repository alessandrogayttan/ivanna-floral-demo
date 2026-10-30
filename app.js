(() => {
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const behavior=()=>motion.matches?'auto':'smooth';
  if('IntersectionObserver' in window&&!motion.matches){
    document.body.classList.add('motion-ready');
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}}),{threshold:.05});
    $$('.reveal').forEach(node=>reveal.observe(node));
  }
  const menu=$('.menu-toggle'),mobile=$('#mobile-nav');
  const closeMenu=(restore=false)=>{
    mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');document.body.classList.remove('menu-open');
    $('main').inert=false;$('.footer').inert=false;
    if(restore)menu.focus();
  };
  menu.addEventListener('click',()=>{
    if(menu.getAttribute('aria-expanded')==='true'){closeMenu();return;}
    mobile.hidden=false;menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Cerrar menú');document.body.classList.add('menu-open');$('main').inert=true;$('.footer').inert=true;$('a',mobile).focus();
  });
  $$('.mobile-nav a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',event=>{
    if(menu.getAttribute('aria-expanded')!=='true')return;
    if(event.key==='Escape'){event.preventDefault();closeMenu(true);}
    if(event.key==='Tab'){
      const links=$$('a',mobile),first=links[0],last=links.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===menu)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();menu.focus();}
    }
  });
  matchMedia('(min-width:701px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
  document.addEventListener('click',event=>{if(event.target instanceof Element&&event.target.closest('[data-open-favorites]'))closeMenu();});

  const svgNS='http://www.w3.org/2000/svg';
  function floralIcon(name){
    const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('aria-hidden','true');
    const use=document.createElementNS(svgNS,'use');use.setAttribute('href',`./assets/floral-sprites.svg#${name}`);svg.append(use);return svg;
  }
  function burst(x,y,amount=16){
    if(motion.matches)return;
    const surface=$('dialog[open]')||document.body;
    for(let index=0;index<amount;index++){
      const node=document.createElement('span');node.className='bloom-particle';node.setAttribute('aria-hidden','true');
      const angle=2*Math.PI*index/amount,distance=65+Math.random()*85;
      node.style.setProperty('--bloom-x',`${x}px`);node.style.setProperty('--bloom-y',`${y}px`);
      node.style.setProperty('--bloom-dx',`${Math.cos(angle)*distance}px`);node.style.setProperty('--bloom-dy',`${Math.sin(angle)*distance-35}px`);
      node.style.setProperty('--bloom-size',`${13+Math.random()*15}px`);node.style.setProperty('--bloom-rotate',`${Math.random()*160-80}deg`);
      node.append(floralIcon(index%3?'heart':'flower'));surface.append(node);setTimeout(()=>node.remove(),1600);
    }
  }
  if(!motion.matches){
    const garden=$('#petal-garden');
    [2,13,27,42,58,73,87,96].forEach((left,index)=>{
      const petal=document.createElement('span');petal.className='drifting-petal';
      petal.style.left=`${left}%`;petal.style.width=`${index%3===0?20:13}px`;petal.style.height=petal.style.width;
      petal.style.setProperty('--fall-time',`${17+index*1.7}s`);petal.style.setProperty('--fall-delay',`${-index*3.5}s`);petal.style.setProperty('--sway',`${index%2?42:-35}px`);
      petal.append(floralIcon(index%3===0?'flower':'heart'));garden.append(petal);
    });
  }
  $('#bloom-magic').addEventListener('click',event=>{const rect=event.currentTarget.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,22);});

  const form=$('#detail-form'),style=$('#detail-style'),occasion=$('#detail-occasion'),recipient=$('#recipient'),sender=$('#sender'),dedication=$('#dedication'),date=$('#preferred-date'),handoff=$('#detail-handoff');
  const styleLabels={personalizado:'Un detalle a tu estilo',f1:'Rosa bonito',f2:'Un día de colores',f3:'Te quiero, y mucho',f4:'Cariño en flor'};
  const occasionLabels={'porque-si':'Porque sí',cumpleanos:'Un cumpleaños',amor:'Mucho amor',gracias:'Decir gracias'};
  const paletteLabels={rosa:'Rositas',color:'Coloridos',rojo:'Románticos',suave:'Suavecitos'};
  const paletteTint={rosa:'#f7dbe6',color:'#f9e2db',rojo:'#efd0dc',suave:'#f4e9df'};
  const budgetLabels={orientacion:'Prefiero que me orienten',hasta500:'Hasta $500 MXN','500a1000':'De $500 a $1,000 MXN','1000a1500':'De $1,000 a $1,500 MXN',mas1500:'Más de $1,500 MXN'};
  const phrases={
    'porque-si':['Porque sí. Porque te mereces algo bonito.','Un poquito de flores y muchísimo cariño para ti.','Que hoy te sobren razones para sonreír.'],
    cumpleanos:['Un año más floreciendo bonito. ¡Feliz cumpleaños!','Que la vida te regale tantos colores como este día.','Hoy celebramos lo bonito que es tenerte.'],
    amor:['Contigo, todo florece.','Te elegiría a ti, en todos mis jardines.','Hay flores bonitas. Y luego estás tú.'],
    gracias:['Gracias por hacer mis días más bonitos.','Un pequeño detalle para un corazón enorme.','Hay personas que hacen florecer todo. Gracias por ser una de ellas.']
  };
  let phraseIndex=0;
  const currentPhrase=()=>phrases[Object.hasOwn(phrases,occasion.value)?occasion.value:'porque-si'][phraseIndex];
  const palette=()=>$('input[name="palette"]:checked',form).value;
  const flip=$('#flip-card'),card=$('#gift-card');
  function setFlipped(flipped){card.classList.toggle('is-flipped',flipped);flip.setAttribute('aria-pressed',String(flipped));flip.replaceChildren(document.createTextNode(flipped?'Ver el frente':'Ver mi dedicatoria'));const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↻';flip.append(arrow);}
  function updatePreview(){
    const who=recipient.value.trim(),from=sender.value.trim(),text=dedication.value.trim();
    $('#card-title').textContent=who?`Para ${who}`:'Para alguien especial';
    $('#card-message').textContent=text||currentPhrase();
    $('#card-from').textContent=from?`Con cariño, ${from}.`:'Con mucho cariño.';
    $('#dedication-count').textContent=`${dedication.value.length} / 220`;
    $('#chosen-style').textContent=styleLabels[style.value]||styleLabels.personalizado;
    $('#phrase-suggestion').textContent=currentPhrase();
    card.style.setProperty('--card-tint',paletteTint[palette()]||paletteTint.rosa);
  }
  flip.addEventListener('click',()=>setFlipped(!card.classList.contains('is-flipped')));
  $('#next-phrase').addEventListener('click',()=>{phraseIndex=(phraseIndex+1)%3;updatePreview();if(!dedication.value.trim())setFlipped(true);});
  $('#use-phrase').addEventListener('click',()=>{dedication.value=currentPhrase();updatePreview();setFlipped(true);$('#form-status').textContent='Frase añadida a tu dedicatoria. Puedes personalizarla.';});
  occasion.addEventListener('change',()=>{phraseIndex=0;updatePreview();setFlipped(true);});
  form.addEventListener('input',event=>{updatePreview();$('#date-error').textContent='';date.removeAttribute('aria-invalid');$('#form-status').textContent='';if([recipient,sender,dedication].includes(event.target))setFlipped(true);});
  form.addEventListener('change',()=>{updatePreview();});
  handoff.addEventListener('change',()=>{const ask=handoff.value==='consultar';$('#zone-label').hidden=!ask;$('#delivery-zone').disabled=!ask;});
  $$('[data-occasion]').forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.occasion;if(!Object.hasOwn(occasionLabels,value))return;
    occasion.value=value;phraseIndex=0;updatePreview();setFlipped(true);
    const rect=button.getBoundingClientRect();burst(rect.left+rect.width/2,rect.top+rect.height/2,10);
    $('#crear-detalle').scrollIntoView({behavior:behavior(),block:'start'});
  }));
  document.addEventListener('ivanna:choose',event=>{
    const id=event.detail?.id;if(!Object.hasOwn(styleLabels,id)||id==='personalizado')return;
    style.value=id;
    const color={f1:'rosa',f2:'color',f3:'rojo',f4:'suave'}[id];$(`input[name="palette"][value="${color}"]`,form).checked=true;
    updatePreview();$('#crear-detalle').scrollIntoView({behavior:behavior(),block:'start'});style.focus({preventScroll:true});
    $('#form-status').textContent=`Elegiste la inspiración ${styleLabels[id]}. Cuéntanos cómo te gustaría tu detalle.`;
  });
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  date.min=`${parts.year}-${parts.month}-${parts.day}`;
  function createMessage(){
    const when=/^\d{4}-\d{2}-\d{2}$/.test(date.value)?date.value.split('-').reverse().join('/'):'';
    const zone=$('#delivery-zone').value.trim();
    return [
      'Hola, Boutique Floral Ivanna ♡ Me gustaría cotizar un detalle floral.',
      `Inspiración: ${styleLabels[style.value]||styleLabels.personalizado}.`,
      `Ocasión: ${occasionLabels[occasion.value]||occasionLabels['porque-si']}.`,
      `Tonos que me gustan: ${paletteLabels[palette()]}.`,
      recipient.value.trim()?`Para: ${recipient.value.trim()}`:'',
      sender.value.trim()?`De parte de: ${sender.value.trim()}`:'',
      dedication.value.trim()?`Dedicatoria que me gustaría incluir:\n${dedication.value.trim()}`:'',
      when?`Fecha de preferencia: ${when} (por confirmar).`:'',
      `Presupuesto aproximado: ${budgetLabels[$('#detail-budget').value]||budgetLabels.orientacion}.`,
      handoff.value==='consultar'?`Me gustaría consultar si hay entrega${zone?` en ${zone}`:' en mi zona'}, así como su costo y disponibilidad.`:'Me gustaría recoger mi detalle en la boutique.',
      '¿Me ayudan a confirmar diseño, flores disponibles, precio y fecha?'
    ].filter(Boolean).join('\n\n');
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!date.checkValidity()||(date.value&&date.value<date.min)){
      $('#date-error').textContent='Elige hoy o una fecha futura, o deja este campo vacío para consultar.';date.setAttribute('aria-invalid','true');date.focus();return;
    }
    $('#date-error').textContent='';date.removeAttribute('aria-invalid');
    const link=document.createElement('a');link.href='https://wa.me/523322751971?text='+encodeURIComponent(createMessage());link.target='_blank';link.rel='noopener noreferrer';document.body.append(link);link.click();link.remove();
    $('#form-status').textContent='Tu mensaje está preparado. Confirma el envío dentro de WhatsApp.';
  });
  $('#copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(createMessage());$('#form-status').textContent='Tu consulta se copió con cariño. Puedes pegarla donde prefieras.';}catch{$('#form-status').textContent='El navegador no permitió copiar. Puedes preparar tu mensaje en WhatsApp.';}});
  form.noValidate=true;$('#detail-submit').disabled=false;$('#delivery-zone').disabled=true;setFlipped(false);updatePreview();

  $('#privacy-open').addEventListener('click',()=>$('#privacy-dialog').showModal());
  $('#about-open').addEventListener('click',()=>$('#about-dialog').showModal());
  ['#privacy-dialog','#about-dialog'].forEach(selector=>{const dialog=$(selector);dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});});
  let updating=false;
  function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=`${total>0?Math.min(100,scrollY/total*100):0}%`;updating=false;}
  addEventListener('scroll',()=>{if(!updating){requestAnimationFrame(updateProgress);updating=true;}},{passive:true});addEventListener('resize',updateProgress,{passive:true});updateProgress();
})();
