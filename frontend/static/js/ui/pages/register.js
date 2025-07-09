export default function registerPage () {
  return `
  <section class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6">
    <!-- Canvas Vanta couvrant tout le viewport -->
    <div id="hero-bg" class="fixed inset-0 -z-10"></div>
    <div class="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Create<br>Account.</h1>
        <p class="text-gray-400">Join the community today.</p>
      </div>
      <form id="register-form"
            class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-6 text-center">Create Account</h2>
        <label class="block mb-2">Email</label>
        <input name="email" type="email" class="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800">
        <label class="block mb-2">Password</label>
        <input name="password" type="password" class="w-full mb-4 px-3 py-2 rounded-lg bg-gray-800">
        <label class="block mb-2">Confirm</label>
        <input name="confirm" type="password" class="w-full mb-6 px-3 py-2 rounded-lg bg-gray-800">
        <button class="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 font-semibold">Create Account</button>
      </form>
    </div>
  </section>`
}