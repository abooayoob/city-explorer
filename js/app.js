/**
 *
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

class SideNav {
  constructor () {
    this.showButtonEl = document.querySelector('.js-menu-show');
    this.hideButtonEl = document.querySelector('.js-menu-hide');
    this.sideNavEl = document.querySelector('.js-side-nav');
    this.sideNavContainerEl = document.querySelector('.js-side-nav-container');

    this.showSideNav = this.showSideNav.bind(this);
    this.hideSideNav = this.hideSideNav.bind(this);
    this.blockClicks = this.blockClicks.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.update = this.update.bind(this);

    this.startX = 0;
    this.currentX = 0;
    this.touchingSideNav = false;

    this.addEventListeners();
  }

  addEventListeners () {
    this.showButtonEl.addEventListener('click', this.showSideNav);
    this.hideButtonEl.addEventListener('click', this.hideSideNav);
    this.sideNavEl.addEventListener('click', this.hideSideNav);
    this.sideNavContainerEl.addEventListener('click', this.blockClicks);

    this.sideNavEl.addEventListener('touchstart', this.onTouchStart);
    this.sideNavEl.addEventListener('touchmove', this.onTouchMove);
    this.sideNavEl.addEventListener('touchend', this.onTouchEnd);
  }

  onTouchStart (evt) {
    if (!this.sideNavEl.classList.contains('side-nav--visible'))
      return;

    this.startX = evt.touches[0].pageX;
    this.currentX = this.startX;

    this.touchingSideNav = true;
    requestAnimationFrame(this.update);
  }

  onTouchMove (evt) {
    if (!this.touchingSideNav)
      return;

    this.currentX = evt.touches[0].pageX;
    const translateX = Math.min(0, this.currentX - this.startX);

    if (translateX < 0) {
      evt.preventDefault();
    }
  }

  onTouchEnd (evt) {
    if (!this.touchingSideNav)
      return;

    this.touchingSideNav = false;

    const translateX = Math.min(0, this.currentX - this.startX);
    this.sideNavContainerEl.style.transform = '';

    if (translateX < 0) {
      this.hideSideNav();
    }
  }

  update () {
    if (!this.touchingSideNav)
      return;



    const translateX = Math.min(0, this.currentX - this.startX);
    this.sideNavContainerEl.style.transform = `translateX(${translateX}px)`;
    requestAnimationFrame(this.update);
  }

  blockClicks (evt) {
    evt.stopPropagation();
  }

  onTransitionEnd (evt) {
    this.sideNavEl.classList.remove('side-nav--animatable');
    this.sideNavEl.removeEventListener('transitionend', this.onTransitionEnd);
  }

  showSideNav () {
    this.sideNavEl.classList.add('side-nav--animatable');
    this.sideNavEl.classList.add('side-nav--visible');
    this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
  }

  hideSideNav () {
    this.sideNavEl.classList.add('side-nav--animatable');
    this.sideNavEl.classList.remove('side-nav--visible');
    this.sideNavEl.addEventListener('transitionend', this.onTransitionEnd);
  }
}

new SideNav();

// Application code starts here

function initializeApplication() {

  // starting point
  var oslo = {lat:59.9138688,lng:10.752245399999993};
  var firstRequest = true;
  var infoWindow = new google.maps.InfoWindow();

  var bounds;

  var foursquare = {
    venues: 'https://api.foursquare.com/v2/venues/',
    explore: 'explore?',
    search: 'search?',
    credentials: 'client_id=Y0DEZ005CDT1Y2FBGGXV4KWYOEPLWAKFXTXC0UXLNAFHTFAY&client_secret=GEA32UVN3CUN0IHNCTSFU1SOABB0WT4HH2U2WYRR3ZLX4JX2',
    version: '&v=20130815'

  };


  // Uses the foursquare api to find popular spots around a provided center
  // @parameter: center, {lat: Number, lng: Number}
  // @parameter: callback function that receives an array of popular spots
  var getPopularSpots = function (center, callback) {

    // if (firstRequest) {
    //   var coordinates = '&ll=' + center.lat + ',' + center.lng;
    //   firstRequest = false;
    // }
    var coordinates = '&ll=' + center.lat + ',' + center.lng;
    var query = '&query=Popular with visitors';

     var request = new XMLHttpRequest();
     request.open(
       'GET',
       foursquare.venues +
       foursquare.explore +
       foursquare.credentials +
       foursquare.version +
       coordinates + query,
       true
     );

     request.onreadystatechange = function() {
       if ( request.readyState != 4  || request.status != 200 ) {
         return;
       }
       var answer = JSON.parse(request.responseText);
       var items = answer.response.groups[0].items;
       callback(items);
     };

     request.send('');
  }


  // Uses the foursquare api to get details of a provided venue
  // @parameter: venueId,
  // @parameter: callback function that receives a venue object to process
  var getVenueDetails = function (venueId, callback) {

    var request = new XMLHttpRequest();
    request.open(
      'GET',
      foursquare.venues +
      venueId +
      '?' +
      foursquare.credentials +
      foursquare.version,
      true
    );

    request.onreadystatechange = function() {
      if ( request.readyState != 4  || request.status != 200 ) {
        return;
      }
      var venue = JSON.parse(request.responseText);
      callback(venue);
    };

    request.send('');

  }

  var constructPhotosArray = function (venue) {
    venue.photoUrls = venue.photos.groups[0].items.map(function (item) {
      return item.prefix + 'original' + item.suffix;
    });
  };

  var constructBestPhoto = function (venue) {
    venue.bestPhotoUrl = venue.bestPhoto.prefix + 'original' + venue.bestPhoto.suffix;
  };

  var heyNewPlace = function (place) {
    bounds = new google.maps.LatLngBounds();
    var index = 0;
    getPopularSpots(place, function (items) {
      items.forEach(function (item) {
        getVenueDetails(item.venue.id, function (responseObject) {
          var venue = responseObject.response.venue;

          var position = {
            lat: venue.location.lat,
            lng: venue.location.lng,
          };

          var marker = new google.maps.Marker({
            map: map,
            title: venue.name,
            position: position
          });

          marker.addListener( 'click', function() {
            showInfo(venue, infoWindow);
          } );

          venue.marker = marker;
          venue.index = index++;
          constructPhotosArray(venue);
          console.log(venue);
          cityExplorer.addVenue(venue);


          bounds.extend(new google.maps.LatLng(position));
          map.fitBounds(bounds);

        });
      });
    });
  };

  var showInfo = function (venue, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != venue.marker) {

      var content = '<div id="content" class="content">'
          + '<h1 class="content__heading" data-bind="text: venueList()[' + venue.index + '].name"></h1>'
          + '<div class="image-slider" data-bind="foreach: venueList()[' + venue.index + '].photoUrls">'
          +    '<div class="image-slider__image-container">'
          +      '<img data-bind="attr: {src: $data}" alt="">'
          +    '</div>'
          +  '</div>'

          + '</div>';


      infowindow.marker = venue.marker;
      infowindow.setContent(content);
      infowindow.open(map, venue.marker);

      // Need to apply bindings because the content gets removed and added
      // to the DOM each time
      ko.applyBindings(cityExplorer, document.getElementById('content'));
    }
  }

  // Create a map and center it in oslo
  var map = new google.maps.Map(document.getElementById('map'), {
    center: oslo,
    zoom: 15,
    fullscreenControl: true
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // When the user selects a search option
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length === 0) {
      return;
    }

    // calculate distance
    var distance =
    google.maps.geometry.spherical.
    computeDistanceBetween(places[0].geometry.location, map.getCenter());

    // Convert to a LatLng literal object
    var newCenter = JSON.stringify(places[0].geometry.location);
    var newCity = JSON.parse(newCenter);

    // If user chose a place far away
    // they probably want to explore another city
    if (distance > 6000) {
      cityExplorer.removeAllVenues();
      heyNewPlace(newCity);
      return;
    }

  });


  var ViewModel = function () {
    this.venueList = ko.observableArray();

    this.addVenue = this.addVenue.bind(this);
    this.removeAllVenues = this.removeAllVenues.bind(this);
  }

  ViewModel.prototype.addVenue = function (venue) {
    this.venueList.push(venue);
  }
  ViewModel.prototype.removeAllVenues = function () {
    this.venueList().forEach(function (venue) {
      venue.marker.setMap(null);
    });
    this.venueList.removeAll();
  }

  var cityExplorer =  new ViewModel();

  ko.applyBindings(cityExplorer);
  heyNewPlace(oslo);
}
