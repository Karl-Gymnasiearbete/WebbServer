async function checkLogin() {
  const res = await fetch('/me');
  if (res.ok) {
    const data = await res.json();
    return data.user;
  }
  return null;
}

async function logout() {
  await fetch('/logout', { method: 'POST' });
  window.location.href = '/login.html';
}