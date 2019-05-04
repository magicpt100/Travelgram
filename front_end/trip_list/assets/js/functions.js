var positions = [];
function delete_node(el) {

  console.log($(el.parentNode));
}
(function () {
    var TripItem;
    TripItem = function (arg) {
        this.title = arg.Title, this.description = arg.Content;
        this.author = arg.UserID
        this.date = get_date(arg.StartTime);
        this.id = arg.TripID;
        this.draw = function (_this, pos) {
            return function (pos) {
                var $tripItem;
                $tripItem = $('.trip-item').clone().removeClass("trip-item");
                $tripItem.find('.title').html(_this.title);
                $tripItem.find('.date').html(_this.date);
                $tripItem.attr('id', this.id)
                console.log($tripItem.prop('id'));
                //$tiemlineItem.find('.date').html(_this.date);
                if ("Images" in arg) {
                    $tripItem = $('.tiemline-withimage').clone().removeClass("tiemline-withimage");
                    $tripItem.find('.title').html(_this.title);
                    $tripItem.find('.date').html(_this.date);
                    $tripItem.find('.description').html(_this.description);
                    $tripItem.attr('id', this.id)
                    console.log($tripItem.prop('id'));
                    positions.push(pos);
                }
                $tripItem.insertBefore($('.last-item'));
            };
        }(this);
        return this;
    };
    function get_date(date) {
        date = new Date(date*1000);
          var monthname = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          var d = new Date();
          var formatted = +d.getDate()+" " + monthname[d.getMonth()]+" "+d.getFullYear();
        return formatted
    }
    function get_nodes() {
      var apigClient = apigClientFactory.newClient();
      console.log(apigClient);
      apigClient.tripsGet({'userName': "st3174"})
        .then(function(result){
          console.log(result)
        });

    }

    function show_tripItem(arg, i){
        var tripItem = TripItem(arg);
        tripItem.draw(i);
    }

    function create_items(items) {
        var i = 0;
        items.forEach(function(item) {
               show_tripItem(item, i++);
        });
    }

    function load_trips() {
      var apigClient = apigClientFactory.newClient();
      console.log("load trips");
      apigClient.tripsGet({'userName': "Gilbert"}, {'userName': "Gilbert"}, {})
        .then(function(result){
          var trips = result.data;
          console.log(trips);
          trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
          create_items(trips);
        });
    }

    function load_my_trips() {
      var apigClient = apigClientFactory.newClient();
      console.log(apigClient);
      apigClient.userUserNameTripGet( {},{'userName': "Gilbert"})
        .then(function(result){
          console.log(result.data)
        });
    }

    function delete_trip(id) {
      var apigClient = apigClientFactory.newClient();
      console.log(apigClient);
      apigClient.userUserNameTripTripIDDelete({'userName': "st3174", 'tripID': id})
        .then(function(result){
          console.log(result)
        });
    }
    if (window.location.href.includes('my_trips')) {
      load_my_trips();
    } else {
      load_trips();
    }
}.call(this));
