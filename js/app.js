/**
 * Google Maps layer
 */

var map;
var markers = [];
var openedInfo = null;


// Configuration object for the project
var config = {
    foursquare: {
        endpoint: "https://api.foursquare.com/v2/venues/",
        params: $.param({
            client_id: 'JPRB0E1CKUTX02G0VHADUOD5U4ANMGYODV2DJ1MHU5DFAILQ',
            client_secret: 'COJQSG54AJW1WZPXZPAOJS3CGCBPTYO3AKKQSKA05I1QKIZN',
            v: '20180610'
        })
    }
};

window.initMap = function () {

    var styles = [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0c4152"
            },
            {
                "lightness": 5
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#09ffc3"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#ff09d8"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
]

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.7490, lng: -84.3880},
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });
};

window.googleError = function(){
    alert("An error while loading Google Maps ocurred, please try to reload the page.");
};

var infoWindowTemplate = function (nightclub) {

    var infoHtml = '<h5>' + nightclub.name + '</h5>';

    if (nightclub.hasOwnProperty('contact')) {
        if (nightclub.contact.hasOwnProperty('formattedPhone')) {
            infoHtml += '<p class="info-phone">';
            infoHtml += '<i class="glyphicon glyphicon-earphone"></i> ';
            infoHtml += '<a href="tel:'+nightclub.contact.formattedPhone+'" title="Call Now!">'+nightclub.contact.formattedPhone+'</a>';
            infoHtml += '</p>';
        }
      }

    infoHtml += '<p class="info-address">';
    infoHtml += '<i class="glyphicon glyphicon-pushpin"></i> ' + nightclub.location.formattedAddress[0]+'<br>';
    infoHtml += nightclub.location.formattedAddress[1]+'<br>';
    infoHtml += '</p>';

    if (nightclub.hasOwnProperty('twitter')) {
        infoHtml += '<p class="info-twitter">' + nightclub.contact.twitter + '</p>';
    }

    return infoHtml;

};


var ViewModel = function () {

    var vm = this;

    vm.locations = ko.observableArray([]);
    vm.query = ko.observable("");

    /**
     * Init the app, fetching nightclubs in Atlanta
     * using the Foursquare API
     */
    vm.init = function () {

        $.ajax({
            url: config.foursquare.endpoint + "search" + "?" + config.foursquare.params,
            data: {
                format: 'json',
                near: 'Atlanta, GA',
                query: 'Nightclub'
            },
            dataType: 'json'
        }).done(function (data) {

            // iterate over the return data
            data.response.venues.forEach(function (venue) {

                var infoTemplate = infoWindowTemplate(venue);

                venue.infoWindow = new google.maps.InfoWindow({
                    content: infoTemplate
                });

                venue.marker = new google.maps.Marker({
                    position: {lat: venue.location.lat, lng: venue.location.lng},
                    animation: google.maps.Animation.DROP,
                    map: map,
                    title: venue.name,
                    icon: 'img/marker.png'
                });

                venue.marker.addListener('click', function () {
                    vm.showInfo(venue);
                });

                vm.locations.push(venue);

                markers.push(venue.marker);

            });

            // vm.getLocations();

        }).fail(function (err) {

            //@TODO Add other type of message
            alert("Oops! An error ocurred while trying to fetch the awesome nightclubs in Atlanta :(");

        });

    };

    /**
     * Filter the current locations by the term typed in the search box
     */
    vm.getLocations = ko.computed(function () {

        //Our desired term
        var term = vm.query();

        //Lowercase the search term to get better results and final UX
        var filter = term.toLocaleLowerCase();

        //If no term typed, then return all the locations
        if (filter === "") {

            ko.utils.arrayForEach(vm.locations(), function (item) {
                item.marker.setMap(map);
            });

            return vm.locations();

        } else {
            return ko.utils.arrayFilter(vm.locations(), function (item) {
                if (item.name.toLowerCase().indexOf(filter) !== -1) {
                    item.marker.setMap(map);
                    return true;
                } else {
                    item.marker.setMap(null);
                    return false;
                }
            });
        }

    });

    /**
     * Select a nightclub in the map
     * @param nightclub
     */
    vm.selectNightclub = function (nightclub) {

        if (nightclub.marker.getAnimation() !== null) {
            nightclub.marker.setAnimation(null);
        } else {

            nightclub.marker.setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function () {
                nightclub.marker.setAnimation(null);
            }, 700);
        }

        vm.toggleNavbar();
        vm.closeAll();
        nightclub.infoWindow.open(map, nightclub.marker);
    };

    /**
     * Show info windows on marker cliok
     * @param nightclub
     */
    vm.showInfo = function (nightclub) {

        if (nightclub.marker.getAnimation() !== null) {
            nightclub.marker.setAnimation(null);
        } else {

            nightclub.marker.setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function () {
                nightclub.marker.setAnimation(null);
            }, 700);
        }

        vm.closeAll();
        nightclub.infoWindow.open(map, nightclub.marker);
    };

    /**
     * Close all the opened infoWindows
     */
    vm.closeAll = function () {
        ko.utils.arrayForEach(vm.locations(), function (nightclub) {
            nightclub.infoWindow.close();
        });
    };

    vm.toggleNavbar = function () {
        $("#list-nightclub").toggleClass('hidden-xs hidden-sm');
    };

    // Run the init function 1 time
    vm.init();

};

var app = new ViewModel();
ko.applyBindings(app);
