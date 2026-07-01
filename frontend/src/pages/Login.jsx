<form onSubmit={handleLogin} autoComplete="off">
  {/* Username / Email Input */}
  <input 
    type="text" 
    placeholder="Username" 
    autoComplete="one-time-code" /* Browser auto-fill block karne ke liye trick */
    required 
  />

  {/* Password Input */}
  <input 
    type="password" 
    placeholder="Password" 
    autoComplete="new-password" /* Strict disable saver */
    required 
  />
  
  <button type="submit">Login</button>
</form>