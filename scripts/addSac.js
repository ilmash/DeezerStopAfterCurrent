function createMenu() {
	var ce = document.createElement.bind(document);
	var sacMenuContainer = ce('div');
	var topLevelList = ce('ul');
	var submenuList = ce('ul');
	
	//submenu
	var subTitle = ce('li');
	var subInput = ce('li');
	var subInputContainer = ce('div');
	var menuLinkElement = ce('a');
	
	//submenu title
	$(menuLinkElement).html("Stop after...");
	$(menuLinkElement).addClass('sac-pointer-default');
	$(subTitle).append(menuLinkElement);
	
	//submenu input
	var menuInputElement = ce('input');
	$(menuInputElement).attr("type", "text");
	$(menuInputElement).attr("id","sacInput");
	$(menuInputElement).on('input', function() {
		var oldInput = $(this).val();
		var inputVal = Number($(this).val());
		var inputNaN = isNaN(inputVal);
		if(inputNaN) {
			inputVal = oldInput.replace(/\D/g,'');
			$(this).val(inputVal);
		}
		if(inputVal > 99) {
			inputVal = 99;
			$(this).val(inputVal);
		}
	});
	$(subInputContainer).append(menuInputElement);

	menuInputElement = ce('input');
	$(menuInputElement).attr("type", "button").attr("value","OK");
	$(menuInputElement).click(function() {
		var tracksQty = $('#sacInput').val();
		tracksQty = Number(tracksQty);
		dzPlayer.stopAfterCurrent.set(tracksQty);
		$('div.sac-menu-content').hide();
	});
	$(subInputContainer).append(menuInputElement);
	
	$(submenuList).append(subTitle);
	$(subInput).append(subInputContainer);
	$(submenuList).append(subInput);
	$(submenuList).addClass('sac-submenu');
	
	//main menu
	var menuStopAfterCurrentPosition = ce('li');
	var menuStopAfterFiveTracksPosition = ce('li');
	var menuStopCustomPosition = ce('li');
	var menuStopCancel = ce('li');
	
	//stop after current position
	menuLinkElement = ce('a');
	$(menuLinkElement).html("Stop after current");
	$(menuLinkElement).click(function() {
		dzPlayer.stopAfterCurrent.set(1);
		$('div.sac-menu-content').hide();
	});
	$(menuStopAfterCurrentPosition).append(menuLinkElement);
	
	//stop after five tracks position
	menuLinkElement = ce('a');
	$(menuLinkElement).html("Stop after 5 tracks");
	$(menuLinkElement).click(function() {
		dzPlayer.stopAfterCurrent.set(5);
		$('div.sac-menu-content').hide();
	});
	$(menuStopAfterFiveTracksPosition).append(menuLinkElement);
	
	//stop custom position
	menuLinkElement = ce('a');
	$(menuLinkElement).html("Custom...");
	$(menuLinkElement).addClass('sac-pointer-default');
	$(menuStopCustomPosition).append(menuLinkElement);
	$(menuStopCustomPosition).append(submenuList);
	
	//stop cancel
	menuLinkElement = ce('a');
	$(menuLinkElement).html("Cancel");
	$(menuLinkElement).click(function() {
		dzPlayer.stopAfterCurrent.reset();
		$('div.sac-menu-content').hide();
	});
	$(menuStopCancel).append(menuLinkElement);
	
	$(topLevelList).append(menuStopCancel);
	$(topLevelList).append(menuStopCustomPosition);
	$(topLevelList).append(menuStopAfterFiveTracksPosition);
	$(topLevelList).append(menuStopAfterCurrentPosition);

	$(sacMenuContainer).append(topLevelList);	
	$(sacMenuContainer).addClass('sac-menu-content');
	$('div.player').append(sacMenuContainer);
}

function createButton() { 
	//create new player interface elements
	var sacListElement = document.createElement('li');
	var sacStopButton = document.createElement('button');
	sacIcon = document.createElement('span');
	
	//interface button
	$(sacIcon).addClass('icon icon-square-fill');
	$(sacStopButton).addClass('control control-next');
	
	//show/hide handling
	$(sacStopButton).click(function() {
		//recalculate position based on player size
		$('.sac-menu-content').css("bottom", $('.player-controls').outerHeight())
		$('div.sac-menu-content').toggle();
	});

	//add to player
	$(sacStopButton).append(sacIcon);
	$(sacListElement).append(sacStopButton);
	$('ul.controls-main').append(sacListElement);
}

function createUI() {
	createMenu();
	createButton();
}

function patchDeezerPlayer() {
	var p = dzPlayer;
	p.stopAfterCurrent = new Object();
	p.stopAfterCurrent.active = false;
	p.stopAfterCurrent.tracksLeft = 0;
	
	p.stopAfterCurrent.eventRespond = function() {
		var sac = dzPlayer.stopAfterCurrent;
		if(sac.active && sac.tracksLeft > 0) {
			sac.tracksLeft--;
			if(sac.tracksLeft <= 0) { //pause player
				dzPlayer.control.pause();
				sac.active = false;
			}
			sac.updateUI();
		}
	}
	
	p.stopAfterCurrent.set = function(noOfTracks) {
		if(noOfTracks < 1) {
			return false;
		}
		
		if(typeof noOfTracks !== "number") {
			return false;
		}
		this.active = true;
		this.tracksLeft = noOfTracks;
		this.updateUI();
	}
	
	p.stopAfterCurrent.reset = function() {
		this.active = false;
		this.tracksLeft = 0;
		this.updateUI();
	}
	
	p.stopAfterCurrent.updateUI = function() {
		setButton(this.active);
		updateTracksLeft(this.tracksLeft);
	}
	
	Events.subscribe(Events.player.track_end, dzPlayer.stopAfterCurrent.eventRespond);
}

/*
	utility functions for UI updating
*/
function setButton(state) {
	if(state) {
		$(sacIcon).removeClass('icon-square-fill').addClass('icon-check');
	} else {
		$(sacIcon).removeClass('icon-check').addClass('icon-square-fill');
	}
}

function updateTracksLeft(tracksLeft) {
	var nbsp = '&nbsp;';
	if(tracksLeft>0) {
		$(sacIcon).html(nbsp+nbsp+tracksLeft);
	} else {
		$(sacIcon).html('');
	}
}

var checkForPlayerControls = setInterval(function() {
	if($('ul.controls-main').length>0) {
		createUI();
		clearInterval(checkForPlayerControls);
	}
}, 1000);

var checkForPlayer = setInterval(function() {
	if(typeof dzPlayer !== "undefined") { //there is something defined
		if(dzPlayer.playerLoaded) { //and player really loaded
			patchDeezerPlayer();
			clearInterval(checkForPlayer);
		}
	}
}, 1000);