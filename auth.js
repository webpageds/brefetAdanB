/* Firebase participant authentication.
   Configure firebase in config.js and deploy firestore.rules before enabling production login. */
(function(){
  const cfg = window.BREVET_CONFIG || {};
  let app, auth, db, ready = false, bypassRegistration = false;
  const $ = s => document.querySelector(s);
  function note(message){
    const toast = $("#toast");
    if(toast){ toast.textContent = message; toast.classList.add("show"); clearTimeout(window.noticeTimer); window.noticeTimer=setTimeout(()=>toast.classList.remove("show"),6500); }
    else alert(message);
  }
  function init(){
    if(!cfg.firebase || !cfg.firebase.apiKey || !cfg.firebase.projectId || !window.firebase) return false;
    try {
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg.firebase);
      auth = firebase.auth();
      db = firebase.firestore();
      ready = true;
      return true;
    } catch(err){ console.error("Firebase initialization failed", err); return false; }
  }
  function errorMessage(err){
    const map = {
      "auth/email-already-in-use":"Email ini sudah terdaftar. Silakan login.",
      "auth/invalid-email":"Format email belum benar.",
      "auth/weak-password":"Password terlalu lemah. Gunakan minimal 8 karakter.",
      "auth/invalid-credential":"Email atau password salah.",
      "auth/too-many-requests":"Terlalu banyak percobaan. Coba lagi nanti.",
      "auth/network-request-failed":"Koneksi bermasalah. Periksa internet lalu coba lagi."
    };
    return map[err.code] || "Proses autentikasi gagal. Periksa konfigurasi Firebase dan coba lagi.";
  }

  document.addEventListener("submit", async function(e){
    const form=e.target;
    if(form.id==="registerForm"){
      if(bypassRegistration) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(!init()){ note("Login/akun belum dikonfigurasi. Admin perlu mengisi konfigurasi Firebase di config.js terlebih dahulu."); return; }
      const password=$("#registerPassword")?.value || "";
      const confirm=$("#registerPasswordConfirm")?.value || "";
      if(password.length<8){note("Password minimal 8 karakter.");return;}
      if(password!==confirm){note("Konfirmasi password tidak sama.");return;}
      const submit=form.querySelector('button[type="submit"]')||form.querySelector("button");
      submit.disabled=true; submit.textContent="Membuat akun…";
      try{
        const email=String(form.elements.email.value||"").trim().toLowerCase();
        const credential=await auth.createUserWithEmailAndPassword(email,password);
        const user=credential.user;
        await user.updateProfile({displayName:String(form.elements.fullName.value||"").trim()});
        await db.collection("participantProfiles").doc(user.uid).set({
          uid:user.uid,
          fullName:String(form.elements.fullName.value||"").trim(),
          email:email,
          phone:String(form.elements.phone.value||"").trim(),
          program:String(form.elements.program.value||""),
          mode:String(form.elements.mode.value||""),
          status:"pending",
          emailVerified:false,
          createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        await user.sendEmailVerification();
        // Password is never sent to the Google Sheets registration endpoint.
        const pw=$("#registerPassword"), pw2=$("#registerPasswordConfirm");
        pw.disabled=true; pw2.disabled=true;
        bypassRegistration=true;
        form.requestSubmit();
        setTimeout(()=>{pw.disabled=false;pw2.disabled=false;bypassRegistration=false;submit.disabled=false;submit.textContent="Kirim Pendaftaran ↗";},1500);
        note("Akun dibuat. Cek email untuk verifikasi; akses kelas tetap menunggu persetujuan panitia.");
      }catch(err){
        console.error(err);
        submit.disabled=false; submit.textContent="Kirim Pendaftaran ↗";
        note(errorMessage(err));
      }
    } else if(form.id==="loginForm"){
      e.preventDefault(); e.stopImmediatePropagation();
      if(!init()){note("Login belum aktif. Admin perlu mengisi konfigurasi Firebase di config.js.");return;}
      const submit=form.querySelector('button[type="submit"]');
      submit.disabled=true; submit.textContent="Memeriksa akun…";
      try{
        const email=String(form.elements.email.value||"").trim().toLowerCase();
        const credential=await auth.signInWithEmailAndPassword(email,form.elements.password.value);
        const user=credential.user;
        await user.reload();
        if(!user.emailVerified){
          await auth.signOut();
          note("Verifikasi email dulu melalui tautan yang kami kirim, lalu login kembali.");
          return;
        }
        const snap=await db.collection("participantProfiles").doc(user.uid).get();
        if(!snap.exists || snap.data().status!=="approved"){
          await auth.signOut();
          note("Akun kamu masih menunggu verifikasi panitia. Kamu bisa login setelah pendaftaran disetujui.");
          return;
        }
        note("Login berhasil. Dashboard peserta belum disiapkan; autentikasi akun sudah berhasil.");
        // No protected dashboard is exposed until a dedicated dashboard is implemented.
      }catch(err){console.error(err);note(errorMessage(err));}
      finally{submit.disabled=false;submit.textContent="Login ke Portal ↗";}
    }
  }, true);

  document.addEventListener("click", async function(e){
    if(e.target.id!=="resetPasswordBtn") return;
    e.preventDefault();
    if(!init()){note("Fitur reset password belum dikonfigurasi Firebase.");return;}
    const email=String($("#loginForm")?.elements.email.value||"").trim().toLowerCase();
    if(!email){note("Masukkan email akun dulu, lalu klik Lupa password.");return;}
    try{await auth.sendPasswordResetEmail(email);note("Link reset password dikirim jika email tersebut terdaftar. Periksa inbox dan folder spam.");}
    catch(err){console.error(err);note(errorMessage(err));}
  });

  window.BrevetAuth={isConfigured:()=>init(),signOut:async()=>{if(init()) await auth.signOut();}};
})();