var imageToUpload, myPos, geolocate, map, devicePlatform;

$(function() {
    setTimeout(function() {
        $('.launcher').hide();  
    }, 1500);
});

class Model {
    constructor() {
        this._mapobjects=[];
    }
    addMapObject(mapobjects){
        this._mapobjects.push(mapobjects);
    }
    getMapObject(index){
        return this._mapobjects[index];
    }
    getMapObjectImgByID(id){
        let i;
        this._mapobjects.forEach(element => {
            if(element.id == id)
                i = element.img;
        });
        return i;
    }
    getAll(){
        return this._mapobjects;
    }
    getSize(){
        return this._mapobjects.length;
    }
    clearModel(){
        this._mapobjects = [];
    }
}

//  CLASSE OGGETTI DELLA MAPPA  //
class MapObject {
    constructor(idTemp, latTemp, lonTemp, typeTemp, sizeTemp, nameTemp, imgTemp){
        this._id = idTemp;
        this._lat = latTemp;
        this._lon = lonTemp;
        this._type = typeTemp;
        this._size = sizeTemp;
        this._name = nameTemp;
        this._img = imgTemp;
    }
    
    get id(){
        return this._id;
    }
    get lat(){
        return this._lat;
    }
    get lon(){
        return this._lon;
    }
    get type(){
        return this._type;
    }
    get size(){
        return this._size;
    }
    get name(){
        return this._name;
    }
    get img(){
        return this._img;
    }
    
    set id(idTemp){
        this._id = idTemp;
    }
    set lat(latTemp){
        this._lat = latTemp;
    }
    set lon(lonTemp){
        this._lon = lonTemp;
    }
    set type(typeTemp){
        this._type = typeTemp;
    }
    set size(sizeTemp){
        this._size = sizeTemp;
    }
    set name(nameTemp){
        this._name = nameTemp;
    }
    set img(imgTemp){
        this._img = imgTemp;
    }
}

mapObjectModel = new Model();

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        

        //this.showMap();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $("#btnSetProfile").click(this.setProfile);
        $("#setProfileImg").click(this.uploadImage);

        $("#btnProfileMap").click(this.mapToProfile);
        $("#btnProfileMap").click(this.getProfile);

        $("#btnRankingMap").click(this.mapToRanking);
        $("#btnRankingMap").click(this.getRanking);

        $("#closeMapObjectPopup").click(this.hideMapObjectPopup); 

        $(".rankingTitle img").click(this.rankingToMapView);
        $("#backBtn").click(this.getProfileToMapView);

        $("#editBtn").click(this.getProfileToChangeData);
        $("#btnChangeData").click(this.changeData);
        $("#backBtnToGetProfile").click(this.changeDataToMapView)

        $("#changeDataImg").click(this.changeImage);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        devicePlatform = device.platform;
        console.log("DEVICE PLATFORM: "+devicePlatform);

        if(devicePlatform == "Android")
            app.triggerAndroid(); 
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if(localStorage.getItem("session_id")==null){
            this.getSessionID();
            $("#map").hide();
            $(".setProfile").show();
        }
        else
        {
            $("#map").show();
            app.showMap();
        }
    },
    getSessionID: function() {
        $.ajax({
            method: 'get',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/register.php",
            dataType: 'json',
                success: function(result) {
                    localStorage.setItem("session_id", result["session_id"]);
                    console.log(localStorage.getItem("session_id"));
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                },
                async:false
        });      
    },
    uploadImage: function() {
        console.log("Camera");

        navigator.camera.getPicture(cameraSuccess, cameraError, { 
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                });
        
        function cameraSuccess(imageData) { 
            console.log(imageData);
            imageToUpload = imageData;
            if(imageToUpload.length <= 137000)
                $('#setProfileImg').attr('src', 'data:image/png;base64,' + imageToUpload);
            else
                alert("Immagine non supportata");
        }  
        
        function cameraError(message) { 
           alert('Failed because: ' + message); 
        }
    },
    getProfile: function() {
        var session_id = localStorage.getItem("session_id");
        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/getprofile.php",
            data: JSON.stringify({session_id : session_id}),
            dataType: 'json',
                success: function(result) {
                    $("#getProfileUsername").html(result["username"]);
                    localStorage.setItem("username", result["username"]);
                    if(result["img"] != null || result["img"] != undefined)
                        $("#getProfileImg").attr("src","data:image/png;base64,"+result["img"]);
                    $("#profileLPValue").html(result["lp"]);
                    $("#profileXPValue").html(result["xp"]);
                    console.log(result);
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                },
                async:false
        });
    },
    setProfile: function() {
        var session_id = localStorage.getItem("session_id");
        var username = $("#setProfileUsername").val();
        console.log(username);

        if(username == "" && imageToUpload == undefined)
            alert("Per giocare è necessario impostare username o password.");
        else {
            $.ajax({
                method: 'post',
                url:"https://ewserver.di.unimi.it/mobicomp/mostri/setprofile.php",
                data: JSON.stringify({session_id : session_id, username : username, img : imageToUpload}),
                dataType: 'json',
                    success: function(result) {
                        $(".app").hide();
                        $("#map").show();
                        app.getUserStats();
                        app.showMap();
                    },
                    error: function(error) {
                        console.error(error);
                        new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                    },
                    async:false
            });
        }  
    },
    changeImage: function() {
        console.log("Camera");

        navigator.camera.getPicture(cameraSuccess, cameraError, { 
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    allowEdit: true,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                });
        
        function cameraSuccess(imageData) { 
            console.log(imageData);
            imageToUpload = imageData;

            if(imageToUpload.length <= 137000) {
                if($(".setProfile").is(":visible"))
                    $('#setProfileImg').attr('src', 'data:image/png;base64,' + imageToUpload);
                else
                    $('#changeDataImg').attr('src', 'data:image/png;base64,' + imageToUpload)
            }  
            else
                alert("Immagine non supportata");           
        }  
        
        function cameraError(message) { 
           alert('Failed because: ' + message); 
        }
    },
    changeData: function() {
        var session_id = localStorage.getItem("session_id");
        var username = $("#changeDataUsername").val();

        if(username == "" && imageToUpload == "")
            alert("Per giocare è necessario impostare username o password.");
        else {
            $.ajax({
                method: 'post',
                url:"https://ewserver.di.unimi.it/mobicomp/mostri/setprofile.php",
                data: JSON.stringify({session_id : session_id, username : username, img : imageToUpload}),
                dataType: 'json',
                    success: function(result) {
                        $(".app").hide();
                        $("#map").show();
                    },
                    error: function(error) {
                        console.error(error);
                        new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                    },
                    async:false
            });
        }
    },
    showMap: function() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiYWxleHBldHR5IiwiYSI6ImNrMzYwd3g1ZzE1M3AzaW1xc2p4YjEwYXgifQ.eni9_w3JUh-rJGByNGrZWA';
        map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/alexpetty/ck5i18u1n0hj41ipkkk2k1ltt', // stylesheet location
            center: [9.191383, 45.464211], // starting position [lng, lat]
            zoom: 9 // starting zoom
        });

        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();
   
        geolocate  = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        });

        map.addControl(geolocate , "bottom-right");  

        geolocate.on('geolocate', function(e) {
            var lon = e.coords.longitude;
            var lat = e.coords.latitude;
            myPos = turf.point([lon, lat]);
        });
        
        map.on('load', function() {
            app.getMarker();
            app.getAdv();
            app.getUserStats();

            if(devicePlatform == "browser")
                app.triggerBrowser();

            setInterval(function() {
                app.getMarker();
            }, 60*1000);   
        });
    },
    getMarker: function() {
        var session_id = localStorage.getItem("session_id");

        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/getmap.php",
            data: JSON.stringify({session_id: session_id}),
            dataType: 'json',
                success: function(result) {
                    //console.log(result["mapobjects"]);                    
                    mapObjectModel.clearModel();
                    $(".candyMarker").remove();
                    $(".monsterMarker").remove();
                                            
                    result["mapobjects"].forEach(element => {                         
                        let x = new MapObject(element["id"], element["lat"], element["lon"], element["type"], element["size"], element["name"]);
                        let imageTemp = app.getObjImg(x);
                        x.img = imageTemp;
                        mapObjectModel.addMapObject(x);
                        app.addMarker(x);                       
                    });
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                }
        });  
    },
    getAdv: function() {
        var session_id = localStorage.getItem("session_id");

        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/getadv.php",
            data: JSON.stringify({session_id: session_id}),
            dataType: 'json',
                success: function(result) {
                    //console.log(result["mapobjects"]);
                    
                    //console.log(result["adv"]);
                     
                    result["adv"].forEach(element => {    
                        app.addAdv(element);                     
                    });
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                }
        });  
    },
    addAdv: function(x) {
        console.log(x);

        var geojson = {
            id: 'marker',
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [x.lon, x.lat]
              },
              properties: {
                nome: x.name,
                text: x.text,
                lat: x.lat,
                lon: x.lon
              }
            }]      
        };

        geojson.features.forEach(function(marker) {
            var el = document.createElement('div');
            let nome = marker.properties.nome;
            let text = marker.properties.text;
            //el.className = 'advMarker';   
            el.innerHTML = nome; 
            el.style.fontSize = "xx-large";
            
            el.addEventListener('click', function(e){
                // Prevent the `map.on('click')` from being triggered
                e.stopPropagation();
                console.log(nome+" "+text);                            

                $(".advPopup").append(
                    "<div class='card text-center advCard'>"+
                        "<h3 class='card-title' id='advName'>"+nome+"</h3>"+
                        "<h5 id='advText'>"+text+"</h5>"+
                        "<div class='row justify-content-center'>"+
                            "<button class='btn btn-lg' id='closeAdvPopup'>Chiudi</button>"+
                        "</div>"+
                    "</div>"
                );

                $("#map").hide();
                $(".advPopup").show();

                $("#closeAdvPopup").on("click", function() {
                    $(".advPopup").empty();
                    $(".advPopup").hide();
                    $("#map").show();
                });
            });
        
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);         
        });
    },
    addMarker: function(x) {
        
        var geojson = {
            id: 'marker',
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [x.lon, x.lat]
              },
              properties: {
                id : x.id,
                nome: x.name,
                tipo: x.type
              }
            }]      
        };

        geojson.features.forEach(function(marker) {
            var el = document.createElement('div');
            let id = marker.properties.id;

            if(x.type == "CA"){
                el.className = 'candyMarker';
                el.id = id;
            }                                                   
            else{
                el.className = 'monsterMarker';
                el.id = id;
            }          
            
            el.addEventListener('click', function(e){
                // Prevent the `map.on('click')` from being triggered
                e.stopPropagation();
                console.log(x.name+" "+x.id);

                var markerPos, distance;

                if(devicePlatform == "browser") {
                    navigator.permissions.query({name:'geolocation'}).then(function(result){
                        if(result.state == 'granted') {
                            geolocate.on('geolocate', function(e) {
                                var lon = e.coords.longitude;
                                var lat = e.coords.latitude;
                                myPos = turf.point([lon, lat]);
                            });
            
                            markerPos = turf.point([x.lon, x.lat]);
                            var options = {units: 'kilometers'};
                            distance = turf.rhumbDistance(myPos, markerPos, options);
                                
                            if(distance < 0.05)
                                app.showMapObjectPopup(x);
                            else
                                app.showMapObjectError(x, distance);
                        }
                        else if(result.state == 'prompt')
                            geolocate.trigger();
                    });
                }
                else if(devicePlatform == "Android") {
                    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
                        switch(status){
                            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                                console.log("Permission granted");

                                geolocate.on('geolocate', function(e) {
                                    var lon = e.coords.longitude;
                                    var lat = e.coords.latitude;
                                    myPos = turf.point([lon, lat]);
                                });
                
                                markerPos = turf.point([x.lon, x.lat]);
                                var options = {units: 'kilometers'};
                                distance = turf.rhumbDistance(myPos, markerPos, options);
                                    
                                if(distance < 0.05)
                                    app.showMapObjectPopup(x);
                                else
                                    app.showMapObjectError(x, distance);

                                break;
                            
                            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                                console.log("Permission not requested");
                                geolocate.trigger();

                                break;
                        }
                    }, function(error){
                        console.error(error);
                    });   
                }

                /* NAVIGATOR, VECCHIO METODO
                if ("geolocation" in navigator) { 
                    navigator.geolocation.getCurrentPosition(position => { 

                        alert(position);

                        //geolocate.trigger();

                        myPos = turf.point([position.coords.longitude, position.coords.latitude]);
                        markerPos = turf.point([x.lon, x.lat]);
                        var options = {units: 'kilometers'};
                        distance = turf.rhumbDistance(myPos, markerPos, options);

                        
                        if(distance < 0.05)
                            app.showMapObjectPopup(x);
                        else
                            app.showMapObjectError(x, distance);
                    }); 
                }
                */

            });
        
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);         
        });
        
    },
    showMapObjectError: function(mapObject, distanza) {
        var distanzaInMetri, distanzaInKM, distanzaString;
        if(distanza < 1.0) {
            distanzaInMetri = Math.round(distanza*1000);
            distanzaString = distanzaInMetri+" M";
        }
        else {
            distanzaInKM = Math.round(distanza);
            distanzaString = distanzaInKM+" KM";
        }

        $(".mapObjectPopup").append(
            "<div class='card text-center mapObjectCard'>"+
                "<h3 class='card-title' id='mapObjectName'></h3>"+
                "<img class='mapObjectImg rounded mx-auto d-block'>"+
                "<h5 id='mapObjectSize'></h5>"+
                "<h5 id='mapObjectInfo'></h5>"+
                "<hr id='mapObjectDivider'>"+
                "<div class='text-center distanceQuery'>"+
                    "<img class='distanceQueryImg mx-auto d-block img-fluid' src='img/toofar.png'>"+
                    "<p style='color:white'>Distanza massima: 50m</p>"+
                "</div>"+
                "<div class='row justify-content-center'>"+
                    "<button class='btn btn-lg' id='closeMapObjectError'>Chiudi</button>"+
                "</div>"+
            "</div>"
        );

        $("#map").hide();
        $(".mapObjectPopup").show();
        $("#mapObjectName").html(mapObject.name);
        $(".mapObjectImg").attr('src', 'data:image/png;base64,' + mapObject.img);  

        if(mapObject.type == "CA")
        {
            var dimensione, guadagno;
            switch(mapObject.size){
                case "S": dimensione = "Piccola"; guadagno = "0 / 50"; break;
    
                case "M": dimensione = "Media"; guadagno = "25 / 75"; break;
    
                case "L": dimensione = "Grande"; guadagno = "50 / 100"; break;
            }
            $("#mapObjectSize").html("Dimensione: "+dimensione);
            $("#mapObjectInfo").html("Guadagno: "+guadagno);

            $(".distanceQuery").append(
                "<p style='color:white'>Distanza attuale: "+distanzaString+"</p>"
            );
        }
        else if(mapObject.type == "MO")
        {
            var dimensione, danni;
            switch(mapObject.size){
                case "S": dimensione = "Piccolo"; danni = "0 / 50"; break;
    
                case "M": dimensione = "Medio"; danni = "25 / 75"; break;
    
                case "L": dimensione = "Grande"; danni = "50 / 100"; break;
            }
            $("#mapObjectSize").html("Dimensione: "+dimensione);
            $("#mapObjectInfo").html("Danni: "+danni);

            $(".distanceQuery").append(
                "<p style='color:white'>Distanza attuale: "+distanzaString+"</p>"
            );
        }

        $("#closeMapObjectError").click(function() {
            $(".mapObjectPopup").empty();
            $(".mapObjectPopup").hide();
            $("#map").show();
        });

    },
    showMapObjectPopup: function(mapObject) {           
        $(".mapObjectPopup").append(
            "<div class='card text-center mapObjectCard'>"+
                "<h3 class='card-title' id='mapObjectName'></h3>"+
                "<img class='mapObjectImg rounded mx-auto d-block'>"+
                "<h5 id='mapObjectSize'></h5>"+
                "<h5 id='mapObjectInfo'></h5>"+
                "<div class='row justify-content-center distanceQuery'>"+
                    "<button class='btn btn-lg fightEatBtn'></button>"+
                "</div>"+
                "<div class='row justify-content-center'>"+
                    "<button class='btn btn-lg' id='closeMapObjectPopup'>Chiudi</button>"+
                "</div>"+
            "</div>"
        );

        $("#map").hide();
        $(".mapObjectPopup").show();
        $("#mapObjectName").html(mapObject.name);
        $(".mapObjectImg").attr('src', 'data:image/png;base64,' + mapObject.img);  

        if(mapObject.type == "CA")
        {
            var dimensione, guadagno;
            switch(mapObject.size){
                case "S": dimensione = "Piccola"; guadagno = "0 / 50"; break;
    
                case "M": dimensione = "Media"; guadagno = "25 / 75"; break;
    
                case "L": dimensione = "Grande"; guadagno = "50 / 100"; break;
            }
            $("#mapObjectSize").html("Dimensione: "+dimensione);
            $("#mapObjectInfo").html("Guadagno: "+guadagno);
            $(".fightEatBtn").html("Mangia");
        }
        else if(mapObject.type == "MO")
        {
            var dimensione, danni;
            switch(mapObject.size){
                case "S": dimensione = "Piccolo"; danni = "0 / 50"; break;
    
                case "M": dimensione = "Medio"; danni = "25 / 75"; break;
    
                case "L": dimensione = "Grande"; danni = "50 / 100"; break;
            }
            $("#mapObjectSize").html("Dimensione: "+dimensione);
            $("#mapObjectInfo").html("Danni: "+danni);
            $(".fightEatBtn").html("Combatti");
        }

        let tempID = mapObject.id;
        let btnID = "fightEatBtn"+tempID;
        let btnID2 = "#fightEatBtn"+tempID;
        $(".fightEatBtn").attr('id', btnID);
        console.log(btnID);
        //localStorage.setItem("markerID", tempID);
        
        $(".fightEatBtn").click(function() {
            app.fightEat(mapObject.id, mapObject.type);
        });
        
        $("#closeMapObjectPopup").click(function() {
            $(".mapObjectPopup").empty();
            $(".mapObjectPopup").hide();
            $("#map").show();
        });

    },    
    fightEat: function(markerID, markerType) {
        var session_id = localStorage.getItem("session_id");
        console.log(markerID);

        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/fighteat.php",
            data: JSON.stringify({session_id : session_id, target_id : markerID}),
            dataType: 'json',
                success: function(result) {
                    console.log(result);

                    //Mostro risultato combattimento
                    let died = result["died"];
                    let lp = result["lp"];
                    let xp = result["xp"];
                    let tipo = markerType;
                    
                    $(".fightEatResult").append("<div class='card text-center fightEatCard'>");
                                   
                    if(tipo == "MO" && died == false)
                        $(".fightEatCard").append("<img class='resultPopupImg mx-auto d-block img-fluid' src='img/vittoria.png'>");
                    else if(tipo == "MO" && died == true)
                        $(".fightEatCard").append("<img class='resultPopupImg mx-auto d-block img-fluid' src='img/morte.png'>");
                    else if(tipo == "CA")
                        $(".fightEatCard").append("<img class='resultPopupImg mx-auto d-block img-fluid' src='img/ricarica.png'>");
                        
                        $(".fightEatCard").append(
                            "<h5 class='resultText'>Ecco i tuoi punti aggiornati:</h5>"+
                            "<table class='table table-sm'>"+
                                "<tbody>"+
                                    "<tr class='text-center'>"+
                                        "<td>"+
                                            "<img id='resultLPImg' src='img/heart.png' >"+
                                        "</td>"+
                                        "<td style='float:left'>"+
                                            "<h5 id='resultLPValue'>"+lp+"</h5>"+
                                        "</td>"+
                                    "</tr>"+
                                    "<tr>"+
                                        "<td>"+
                                            "<img id='resultXPImg' src='img/star.png'>"+
                                        "</td>"+
                                        "<td style='float:left'>"+
                                            "<h5 id='resultXPValue'>"+xp+"</h5>"+
                                        "</td>"+
                                    "</tr>"+
                                "</tbody>"+
                            "</table>"+
                            "<div class='row justify-content-center'>"+
                                "<button class='btn btn-lg' id='closeResultPopup'>Chiudi</button>"+
                            "</div>"+
                        "</div>"
                        );
            
                    $(".mapObjectPopup").empty();
                    $(".fightEatResult").show();
                            
                    $("#closeResultPopup").click(function() {
                        $(".fightEatResult").hide();
                        $(".fightEatResult").empty();
                        app.hideMapObjectPopup();                       
                        app.getUserStats();

                        if(tipo == "CA")
                            app.getMarker();
                        else if(tipo == "MO" && died == false)
                            app.getMarker();
                        else if(tipo == "MO" && died == true)
                            console.log("Sei morto, non bisogna aggiornare la mappa");
                        
                        $("#map").show();
                    });
            
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                },
                async:false
        });        
    },
    showResult: function(died, lp, xp, tipo) {
        console.log("FUnzione "+died+" "+lp+" "+xp+" "+tipo);

       
    },
    getObjImg: function(mapObject) {
        var session_id = localStorage.getItem("session_id");
        var immagine;

        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/getimage.php",
            data: JSON.stringify({session_id : session_id, target_id : mapObject.id}),
            dataType: 'json',
                success: function(result) {
                    //console.log(result);
                    immagine = result["img"];      
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                },
                async:false
        });

        return immagine;
    },
    hideMapObjectPopup: function() {
        $(".mapObjectPopup").hide();
        $("#map").show();
    },
    mapToProfile: function() {
        $("#map").hide();
        $(".getProfile").show();
    },
    mapToRanking: function() {
        $("#map").hide();
        $(".ranking").show();   
    },
    rankingToMapView: function() {
        $(".ranking").hide();
        $("#map").show();
    },
    getProfileToMapView: function() {
        $(".getProfile").hide();
        $("#map").show();
    },
    getProfileToChangeData: function() {
        let username = localStorage.getItem("username");
        let img = $("#getProfileImg").attr("src");
        $("#changeDataUsername").val(username);
        $("#changeDataImg").attr("src", img);
        $(".getProfile").hide();
        $(".changeData").show();
    },
    changeDataToMapView: function() {
        $(".changeData").hide();
        $("#map").show();
    },
    getRanking: function() {
        var session_id = localStorage.getItem("session_id");  
        //console.log(mapObjectModel.getMapObjectImgByID(19));

        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/ranking.php",
            data: JSON.stringify({session_id : session_id}),
            dataType: 'json',
                success: function(result) {
                    console.log(result);
                    let i = 1;

                    $("#rankingList").html("");

                    console.log(result["ranking"].length);

                    if(result["ranking"].length == 0) {
                        $("#rankingCardBody").append(""+
                            "<div class='alert alert-danger' role='alert'>"+
                                "Nessun risultato."+
                            "</div>");
                    }
                    else {
                        result["ranking"].forEach(element => {
                            //console.log(element);
    
                            let imgSrc="";
                            if(typeof element["img"] === 'undefined' || element["img"] === null || element["img"].length < 20)
                                imgSrc = "img/avatar.png";
                            else
                                imgSrc = "data:image/png;base64,"+element["img"];

                            let user = element["username"];
                            
                            $("#rankingList").append(""+
                               "<tr class='rankingListRow'>"+
                                    "<th scope='row' class='rankingListNum'>"+i+"</th>"+
                                    "<td><img class='rankingListImg' src='"+imgSrc+"'></td>"+
                                    "<td>"+
                                        "<h5 class='rankingListUser'><b>"+user+"</b></h5>"+
                                        "<p class='rankingListLP'>"+element['lp']+" LP</p>"+
                                    "</td>"+
                                    "<td><h5 class='rankingListXP'><b>"+element['xp']+" XP</b></h5></td>"+                      
                                "</tr>");
                            i++;
                        });

                        $(".rankingListRow").on("click", function() {
                            let nome = $(this).find(".rankingListUser").text();
                            console.log(nome);
                        });
                    }           
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                }
        });

        
    },
    getUserStats: function() {
        var session_id = localStorage.getItem("session_id");

        $.ajax({
            method: 'post',
            url:"https://ewserver.di.unimi.it/mobicomp/mostri/getprofile.php",
            data: JSON.stringify({session_id : session_id}),
            dataType: 'json',
                success: function(result) {
                    $("#userStatsLP").html(result["lp"]);
                    $("#userStatsXP").html(result["xp"]);
                },
                error: function(error) {
                    console.error(error);
                    new Android_Toast({content: 'Connessione assente', duration: 4000, position: 'bottom'});
                }
        });
    },
    triggerBrowser: function() {
        if($("#map").is(':visible')) {
            navigator.permissions.query({name:'geolocation'}).then(function(result){
                console.log(result.state);
                if(result.state == 'granted')
                    geolocate.trigger();
            });
        }
    },
    triggerAndroid: function() {
        cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
            switch(status){
                case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                    console.log("Permission granted");
                    geolocate.trigger();
                    break;
            }
        }, function(error){
            console.error(error);
        });   
    }
};
