var windows = [];
var icons = [];


window.addEventListener('load', () => {
	implement(document.querySelector('.windows95'));
});


function implement(container) {
	const nodeList = container.querySelectorAll('*');
	const elements = Array.from(nodeList);
	elements.push(container);

	for (const el of elements) {
		if (el.matches('.windows95')) {
			el.onclick = (e) => {
				if (
					e.target.matches('.windows95 .taskbar') ||
					e.target.matches('.windows95 > .desktop') ||
					e.target.matches('.windows95 > .desktop *')
				)
					unfocusAllWindows();
			};
		}
		else if (el.matches('.window')) {
			windows.push(el);

			el.onclick = (e) => {
				if (e.target.classList.contains('close')) {
					closeWindow(el);
				}
				else if (e.target.classList.contains('maximize')) {
					maximizeWindow(el);
					e.target.innerText = e.target.innerText === '🗖' ? '🗗' : '🗖';
				}
				else if (e.target.classList.contains('minimize')) {
					minimizeWindow(el);
				}
			};
			
			el.onmousedown = (e) => {
				focusWindow(el);

				if (el.classList.contains('maximized')) return;
				if (e.target.classList.contains('titlebar') || e.target.classList.contains('title')) {
					let offsetX = el.offsetLeft - e.clientX;
					let offsetY = el.offsetTop - e.clientY;
					
					document.onmousemove = (e) => {
						e.preventDefault();
						el.style.left = e.clientX + offsetX + 'px';
						el.style.top = e.clientY + offsetY + 'px';
					};
					document.onmouseup = () => {
						document.onmousemove = null;
						document.onmouseup = null;
					};
				}
			};
		}
		else if (el.matches('.maximize')) {
			el.innerText = '🗖';
		}
		else if (el.matches('.minimize')) {
			el.innerText = '🗕';
		}
		else if (el.matches('.close')) {
			el.innerText = '🗙';
		}
		else if (el.matches('.icon')) {
			icons.push(el);
			
			el.onmousedown = (e) => {
				icons.forEach(i => {
					i.classList.remove('focused');
				});
				el.classList.add('focused');
			};
		}
	}
}

function focusWindow(w) {
	w.hidden = false;
	windows.forEach(w => {
		w.classList.remove('focused');
	});
	w.classList.add('focused');

	const appbtns = document.querySelectorAll('.taskbar .appbtn');
	appbtns.forEach(a => {
		if (a.getAttribute('data-window') === w.id)
			a.classList.add('focused');
		else
			a.classList.remove('focused');
	});
}

function bringUpWindow(w) {
	// Reverse minimize animation
	if (w.hidden) {
		const rect = w.rect;
		const appbtnRect = document.querySelector(`.taskbar .appbtn[data-window="${w.id}"]`).getBoundingClientRect();

		const wph = document.createElement('div');
		wph.classList.add('wph');
		w.parentNode.appendChild(wph);
		wph.style.top = appbtnRect.top + 'px';
		wph.style.left = appbtnRect.left + 'px';
		wph.style.width = appbtnRect.width + 'px';
		wph.style.height = appbtnRect.height + 'px';
		
		setTimeout(() => {
			wph.style.left = rect.left + 'px';
			wph.style.top = rect.top + 'px';
			wph.style.width = rect.width + 'px';
			wph.style.height = rect.height + 'px';
		}, 10);
		setTimeout(() => {
			wph.remove();
			focusWindow(w);
		}, 350);
	}
	else {
		focusWindow(w);
	}
}

function unfocusWindow(w) {
	w.classList.remove('focused');
	document.querySelector('.taskbar .appbtn.focused').classList.remove('focused');
}

function unfocusAllWindows() { 
	windows.forEach(w => {
		unfocusWindow(w);
	});
}

function addAppbtn(w) {
	const appbtn = document.createElement('button');
	appbtn.classList.add('appbtn');
	appbtn.innerText = w.id;
	appbtn.setAttribute('data-window', w.id);
	appbtn.onclick = () => {
		if (appbtn.classList.contains('focused'))
			minimizeWindow(w);
		else
			bringUpWindow(w);
	};

	document.querySelector('.taskbar').appendChild(appbtn);
}

function removeAppbtn(w) {
	const appbtn = document.querySelector(`.taskbar .appbtn[data-window="${w.id}"]`);
	if (appbtn) appbtn.remove();
}

function changeCursor(index) {
	const cursors = [
		'../assets/cursors/arrow.cur',
		'../assets/cursors/pointer.cur',
		'../assets/cursors/wait.cur',
		'../assets/cursors/bgwait.cur',
		'../assets/cursors/beam.cur'
	];

	
	document.querySelector('.windows95').style.cursor = 'none';
	setTimeout(() => {		
		document.querySelector('.windows95').style.cursor = `url(${cursors[index]}), auto`;
	}, 50);
}

function openWindow(templateId) {
	const template = document.getElementById(templateId);
	if (!template) return;
	let existingW = windows.find(w => w.id === template.id);
	if (existingW) {
		bringUpWindow(existingW);
		return;
	}

	const w = document.createElement('div');
	w.id = template.id;
	w.classList.add('window');
	w.appendChild(template.content.cloneNode(true));
	document.querySelector('.windows95').appendChild(w);
	w.style.left = window.innerWidth / 2 - w.offsetWidth / 2 + 'px';
	w.style.top = window.innerHeight / 2 - w.offsetHeight / 2 + 'px';
	implement(w);
	addAppbtn(w);
	focusWindow(w);
}

function openWindowLoad(templateId) {
	const template = document.getElementById(templateId);
	if (!template) return;
	let existingW = windows.find(w => w.id === template.id);
	if (existingW) {
		bringUpWindow(existingW);
		return;
	}

	const root = document.querySelector('.windows95');
	root.classList.add('nocur');
	setTimeout(() => {
		openWindow(templateId);
	}, 800);
	
	// Cursor animation
	changeCursor(2);
	setTimeout(() => {
		changeCursor(3);
	}, 150);
	setTimeout(() => {
		changeCursor(0);
	}, 1000);
}

function closeWindow(w) {
	w.remove();
	windows.splice(windows.indexOf(w), 1);
	removeAppbtn(w);
}

function minimizeWindow(w) {
	// Save the client rect before hiding
	const rect = w.getBoundingClientRect();
	const appbtnRect = document.querySelector(`.taskbar .appbtn[data-window="${w.id}"]`).getBoundingClientRect();
	w.rect = rect

	w.hidden = true;
	unfocusWindow(w);

	// Minimize animation
	const wph = document.createElement('div');
	wph.classList.add('wph');
	wph.style.left = rect.left + 'px';
	wph.style.top = rect.top + 'px';
	wph.style.width = rect.width + 'px';
	wph.style.height = rect.height + 'px';
	w.parentNode.appendChild(wph);
	
	setTimeout(() => {
		wph.style.top = appbtnRect.top + 'px';
		wph.style.left = appbtnRect.left + 'px';
		wph.style.width = appbtnRect.width + 'px';
		wph.style.height = appbtnRect.height + 'px';
	}, 10);
	setTimeout(() => {
		wph.remove();
	}, 350);
}

function maximizeWindow(w) {
	// Maximize animation
	const rect = w.getBoundingClientRect();
	const goalRect = !w.classList.contains('maximized') ? new DOMRect(0, 0, window.innerWidth, window.innerHeight) : w.rect;
	if (!w.classList.contains('maximized'))
		w.rect = rect;
	w.hidden = true;

	const wph = document.createElement('div');
	wph.classList.add('wph');
	wph.style.left = rect.left + 'px';
	wph.style.top = rect.top + 'px';
	wph.style.width = rect.width + 'px';
	wph.style.height = rect.height + 'px';
	w.parentNode.appendChild(wph);
	
	setTimeout(() => {
		wph.style.left = goalRect.left + 'px';
		wph.style.top = goalRect.top + 'px';
		wph.style.width = goalRect.width + 'px';
		wph.style.height = goalRect.height + 'px';
	}, 10);
	setTimeout(() => {
		wph.remove();
		w.classList.toggle('maximized');
		w.hidden = false;
	}, 350);
}
