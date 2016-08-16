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

  var bounds = new google.maps.LatLngBounds();

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

  var heyNewPlace = function (place) {
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
            console.log(marker.title);
          } );

          venue.marker = marker;
          console.log(venue);
          cityExplorer.addVenue(venue);


          bounds.extend(new google.maps.LatLng(position));
          map.fitBounds(bounds);

        });

      });
    });
  };

  heyNewPlace(oslo);


  // Find the distance between 2 latitude and longitude pairs in kilometers
  // code copied from here: http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula?page=1&tab=votes#tab-top
  var calculateDistance = function (lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  var degreesToRadians = function (deg) {
    return deg * (Math.PI/180)
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




  var ViewModel = function () {
    this.venueList = ko.observableArray([]);

    this.addVenue = this.addVenue.bind(this);
  }

  ViewModel.prototype.addVenue = function (marker) {
    this.venueList.push(marker);
  }

  var cityExplorer =  new ViewModel();

  ko.applyBindings(cityExplorer);
}
