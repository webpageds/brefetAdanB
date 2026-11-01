const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],toast=$("#toast");
let pendingRequestId="",registrationTimer=null,registrationLocked=false;

function notify(t){
  toast.textContent=t;
  toast.classList.add("show");
  clearTimeout(window.noticeTimer);
  window.noticeTimer=setTimeout(()=>toast.classList.remove("show"),5000);
}
function close(){
  $$(".modal").forEach(m=>m.classList.remove("open"));
  document.body.style.overflow="";
}
function setRegistrationBusy(busy){
  const form=$("#registerForm");
  const submit=form.querySelector('button[type="submit"]')||form.querySelector("button");
  registrationLocked=busy;
  form.setAttribute("aria-busy",busy?"true":"false");
  submit.disabled=busy;
  submit.textContent=busy?"Mengirim pendaftaran…":"Kirim Pendaftaran ↗";
  submit.setAttribute("aria-live","polite");
  submit.style.opacity=busy?".65":"";
  submit.style.cursor=busy?"not-allowed":"";
}

$$("[data-modal]").forEach(b=>b.addEventListener("click",()=>{
  const m=$("#"+b.dataset.modal);
  if(m){m.classList.add("open");document.body.style.overflow="hidden";}
}));
$$("[data-close]").forEach(b=>b.addEventListener("click",close));
document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
$$("[data-program]").forEach(b=>b.addEventListener("click",()=>{
  $("#register").classList.add("open");
  $("#programSelect").value=b.dataset.program;
  document.body.style.overflow="hidden";
}));
$("#hamb").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$$("nav a").forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));

$("#registerForm").addEventListener("submit",e=>{
  const form=e.currentTarget;
  // Lock synchronously before the browser submits to the hidden iframe.
  if(registrationLocked||pendingRequestId){
    e.preventDefault();
    return;
  }

  const endpoint=String((window.BREVET_CONFIG&&window.BREVET_CONFIG.appsScriptUrl)||"").trim();
  if(!endpoint||!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)){
    e.preventDefault();
    notify("Pendaftaran belum aktif. Admin perlu mengisi URL Apps Script di config.js.");
    return;
  }

  // Prevent resubmission by Enter key or rapid repeated clicks while a request is pending.
  setRegistrationBusy(true);
  pendingRequestId=(window.crypto&&crypto.randomUUID)
    ?crypto.randomUUID().replace(/-/g,"")
    :Math.random().toString(36).slice(2)+Date.now().toString(36);
  $("#requestId").value=pendingRequestId;
  form.action=endpoint;
  notify("Mengirim pendaftaran. Tombol dikunci sampai hasil diterima.");

  registrationTimer=setTimeout(()=>{
    if(pendingRequestId){
      // Unknown outcome: keep the form locked to avoid creating duplicate registrations.
      notify("Konfirmasi belum diterima. Periksa status pendaftaran melalui panitia sebelum mencoba kembali.");
    }
  },20000);
});

window.addEventListener("message",e=>{
  const d=e.data;
  if(!d||d.type!=="brevet-registration-result"||!pendingRequestId||d.requestId!==pendingRequestId)return;
  clearTimeout(registrationTimer);
  pendingRequestId="";
  if(d.status==="success"){
    setRegistrationBusy(false);
    $("#registerForm").reset();
    close();
    notify("Pendaftaran terkirim! Panitia akan memeriksa data kamu.");
  }else{
    setRegistrationBusy(false);
    notify(d.message||"Pendaftaran gagal. Periksa data dan coba lagi.");
  }
});

$("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  notify("Login peserta belum diaktifkan. Jangan masukkan password sampai sistem autentikasi resmi tersedia.");
});
$$(".faq-list details").forEach(d=>d.addEventListener("toggle",()=>{
  if(d.open)$$(".faq-list details").filter(x=>x!==d).forEach(x=>x.open=false);
}));
