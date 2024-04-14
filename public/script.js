let toggleLikeForm = document.querySelector('#toggle-like');
toggleLikeForm.addEventListener('submit', function(submitEvent) {

	let form = this;
	let data = new FormData(form)

	data.append('enhanced', true);

	// Gebruik het action attribuut uit de HTML
	fetch(form.action, {
		method: form.method,
		body: new URLSearchParams(data)
	}).then(function(response) {
		return response.text();
	}).then(function(responseHtml) {
		// Overschrijf de HTML van het formulier
		form.innerHTML = responseHtml;
	})

	// Als alles gelukt is; negeer het default event,
	// in dit geval de submit van het formulier
	submitEvent.preventDefault();
});


let postMessageForm = document.querySelector('#post-message');
postMessageForm.addEventListener('submit', function(submitEvent) {

	let form = this;
	let data = new FormData(form)

	data.append('enhanced', true);

	// Gebruik het action attribuut uit de HTML
	fetch(form.action, {
		method: form.method,
		body: new URLSearchParams(data)
	}).then(function(response) {
		return response.text();
	}).then(function(responseHtml) {
		// Overschrijf de HTML van het formulier
		document.getElementById('messages').outerHTML = responseHtml;
		// En reset het formulier
		form.reset();
		// Je kunt dit zo gek maken als je wilt
	})

	// Als alles gelukt is; negeer het default event,
	// in dit geval de submit van het formulier
	submitEvent.preventDefault();
});