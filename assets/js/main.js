// Nav toggle for mobile
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.navbar-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// Active nav link
const path = window.location.pathname;
document.querySelectorAll('.navbar-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href !== '/' && path.startsWith(href)) link.classList.add('active');
  if (href === '/' && path === '/') link.classList.add('active');
});

// Copy code blocks on click
document.querySelectorAll('pre').forEach(block => {
  block.style.cursor = 'pointer';
  block.title = 'Click to copy';
  block.addEventListener('click', () => {
    navigator.clipboard.writeText(block.innerText).then(() => {
      const orig = block.style.borderColor;
      block.style.borderColor = 'var(--cyan)';
      setTimeout(() => block.style.borderColor = orig, 800);
    });
  });
});
