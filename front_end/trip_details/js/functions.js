var positions = [];
(function () {
    var TimelineItem;
    TimelineItem = function (arg) {
        this.title = arg.Title, this.description = arg.Content;
        this.date = get_date(arg.Time);
        this.id = arg.NodeID;
        this.draw = function (_this, pos) {
            return function (pos) {
                var $timelineItem;
                $timelineItem = $('.right-item').clone().removeClass("right-item");
                $timelineItem.find('.title').html(_this.title);
                $timelineItem.find('.description').html(_this.description);
                $timelineItem.find('.date').html(_this.date);
                //$tiemlineItem.find('.date').html(_this.date);
                if ("Images" in arg) {
                    $timelineItem = $('.tiemline-withimage').clone().removeClass("tiemline-withimage");
                    $timelineItem.find('.title').html(_this.title);
                    $timelineItem.find('.date').html(_this.date);
                    $timelineItem.find('.description').html(_this.description);
                    $timelineItem.attr('id', this.id)
                    console.log($timelineItem.prop('id'));
                    positions.push(pos);
                }
                $timelineItem.insertBefore($('.last-item'));
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
      apigClient.tripTripIDNodesGet({'TripID': 1})
        .then(function(result){
          items = result.data;
          items.sort((a,b) => (a.Time > b.Time) ? 1 : ((b.Time > a.Time) ? -1 : 0));
          create_items(items);
        var tmp2 =  document.getElementById('tmp2');
        var tmp1 = document.getElementById('tmp1');
        tmp2.parentNode.removeChild(tmp2);
        tmp1.parentNode.removeChild(tmp1);
        var swiperid = 0;
        var elements = document.getElementsByClassName('swiper-container');
        Array.prototype.forEach.call(elements, function (element) {
            element.className += " " + 'swiper-container'+swiperid++;
        });
        var i;
        for (i = 0; i < swiperid; i++) {
          var swiper = new Swiper('.swiper-container'+i);
          var pos = positions[i];
          var images = items[pos].Images;
          var urls = []
         Array.prototype.forEach.call(images, function (image) {
            urls.push(image.Url);
         });
         console.log(urls);
         Array.prototype.forEach.call(images, function (image) {
             var slide = "<div class='swiper-slide'> <img src='" + image.Url +"' alt=''/></div>"
             console.log(slide)
            var newSlide = swiper.appendSlide(slide,'swiper-slide blue-slide','div');
         });
        }
          // Add success callback code here.
        }).catch( function(result){
            console.log(result);
          // Add error callback code here.
        });
    }
    function show_timelineItem(arg, i){
        var timelineItem = TimelineItem(arg);
        timelineItem.draw(i);
    }

    function create_items(items) {
        var i = 0;
        items.forEach(function(item) {
               show_timelineItem(item, i++);
        });
    }
    get_nodes();
}.call(this));
