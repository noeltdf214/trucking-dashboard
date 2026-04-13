
const form = document.getElementById('contactForm');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  const fullSubject = encodeURIComponent(subject || 'Website inquiry');
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:tripledfinestlogistics@gmail.com?subject=${fullSubject}&body=${body}`;
});
