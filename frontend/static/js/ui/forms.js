import { api } from '../core/api.js'

export function bindForms (path) {
  /* ---------------- LOGIN ---------------- */
  document.getElementById('login-form')?.addEventListener('submit',async e=>{
    e.preventDefault()
    const { email,password } = Object.fromEntries(new FormData(e.target))
    try {
      const d = await api('/login',{email,password})
      localStorage.setItem('token',d.idToken)
      history.pushState(null,'','/profile')
      dispatchEvent(new PopStateEvent('popstate'))
    } catch { alert('Login failed') }
  })

  /* --------------- REGISTER -------------- */
  document.getElementById('register-form')?.addEventListener('submit',async e=>{
    e.preventDefault()
    const {email,password,confirm}=Object.fromEntries(new FormData(e.target))
    if(password!==confirm) return alert('Passwords differ')
    try{
      await api('/register',{email,password})
      alert('Account created. Log in!')
      history.pushState(null,'','/login'); dispatchEvent(new PopStateEvent('popstate'))
    } catch { alert('Register failed') }
  })

  /* ---- Save Display-Name bouton --------- */
  document.getElementById('save-username')?.addEventListener('click',async ()=>{
    const inp=document.querySelector('[name="username"]')
    const username=inp.value.trim(); if(!username) return alert('Enter a name')
    try { await api('/profile',{username},'POST'); alert('Name updated!'); location.reload() } catch { alert('Update failed') }
  })

  /* ---- Connect socials (faux OAuth) ---- */
  document.querySelectorAll('[data-connect]').forEach(btn=>{
    btn.addEventListener('click',async e=>{
      const provider=e.currentTarget.dataset.connect
      alert(`TODO: OAuth ${provider}`)
      try{ await api('/profile',{[provider]:true},'POST'); location.reload() }catch{}
    })
  })
}
