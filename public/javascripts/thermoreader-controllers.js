var thermoreader = thermoreader || {};

thermoreader.mainCtrl = function($scope, $rootScope, $routeParams, $document, $http, $timeout, dbFactory) {

  $scope.pageName = $routeParams.pageName;

  $scope.orderRule = localStorage.hasOwnProperty('orderRule')? localStorage['orderRule']:"popular";
  $scope.isLoading = false;
  $scope.isEndOfFeed = false;
  $scope.viewMode = "listMode"; // or "articleMode"

  $scope.allFeeds = dbFactory.getAllFeeds(false, function(allFeeds){
    $scope.allFeeds = allFeeds;
  });

  // If the page is to display a feed
  $scope.selectedFeed = [];
  switch($scope.pageName){
    case "home":
    case "recommendation":
      $scope.selectedFeed = { name: "Recommendations", articles: [] };
      $scope.selectedFeed.articles = dbFactory.getRecommendations(function(recommendations) {
        $scope.selectedFeed.articles = recommendations;
      });
      break;
    case "feed":
      $scope.selectedFeed = dbFactory.getFeed($routeParams.feedId, false, function(feed){
        $scope.selectedFeed = feed;
      });
  }

  // Feed Page Functions
  $scope.expandArticle = function(article){
    article.expanded = !article.expanded;
    // Fetch the articles in this feed
    if(article.expanded && !article.read){
      $http.put("/article/"+article.id+"/read").success( function(){
        article.read = true;
      });
      $http.put("/userfeed/"+$scope.selectedFeed.userFeedId+"/inc_popularity");
    }

    // Temporary disable duplicates before underlying service is reasonably working
    // dbFactory.getDuplicates(article.id, function(d){
    //   console.log(d);
    //   if(d.length > 0){ article.duplicates = [new thermoreader.model.article(
    //     article.id, article.title, article.author, article.date,
    //     article.feedName, article.summary, article.description,
    //     article.link, article.popular, article.read
    //   )].concat(d); }
    // });
  };

  $scope.replaceArticle = function(article, dupArticle){
    article.title = dupArticle.title;
    article.link = dupArticle.link;
    article.date = dupArticle.date;
    article.author = dupArticle.author;
    article.feedName = dupArticle.feedName;
    article.description = dupArticle.description;
  };

  $scope.setOrderRule = function(rule){
    $scope.orderRule = rule;
    localStorage['orderRule'] = rule;
  };

  $scope.fetchData = function(){
    if($scope.pageName == "feed"){
      if(!$scope.isEndOfFeed && !$scope.isLoading){
        $scope.isLoading = true;
        dbFactory.getFeed($routeParams.feedId, true, function(feed){
          if($scope.selectedFeed.length == feed.length){ $scope.isEndOfFeed = true; }
          else { $scope.selectedFeed = feed; }
          $scope.isLoading = false;
        });
      }
    }
    //$scope.$apply();
  };

  /* Manage Page Functions */
  $scope.addNewCategory = function(){
    var categoryName = window.prompt("Please input category name", "Untitiled Category");
    if(categoryName != null && $.trim(categoryName) != ""){
      $http.post("/category/create", {
        data: categoryName
      }).success(function(d) {
        console.log("successful adding new category");
        dbFactory.getAllFeeds(true, function(allFeeds){
          $scope.allFeeds = allFeeds;
        });
      });
    }
  }

  $scope.deleteCategory = function(category){
    console.log(category);
    $http.delete("/category/" + category.id).success(function() {
      console.log("successful delete");
      dbFactory.getAllFeeds(true, function(allFeeds){
        $scope.allFeeds = allFeeds;
      });
    });
  }

  $scope.deleteUserFeed = function(category, feed) {
    $http.delete("/category/" + category.id + "/" + feed.userFeedId).success(function() {
      console.log("successful delete");
      dbFactory.getAllFeeds(true, function(allFeeds){
        $scope.allFeeds = allFeeds;
      });
    });
  };

  $scope.addNewFeed = function(category, feedURL) {
    $scope.manageFeedURL = "";
    $http.post("/category/" + category.id + "/add_feed", {
      data: feedURL // ex. http://rss.sina.com.cn/news/allnews/tech.xml
    }).success(function(d) {
      console.log("successful adding new feed");
      dbFactory.getAllFeeds(true, function(allFeeds){
        $scope.allFeeds = allFeeds;
      });
    });
  };

  $scope.$on('$viewContentLoaded', function(){
    $('#side-container').perfectScrollbar({wheelSpeed: 60});
    $('#content-container').perfectScrollbar({wheelSpeed: 60});
  });

  // Hack to keep the menu scrollTop and perfectScrollBar
  $scope.$on('$routeChangeStart', function(next, current) {
    $rootScope.menuScrollTop = $('#side-container').scrollTop();
  });
  $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    $timeout(function(){$('#side-container').scrollTop($rootScope.menuScrollTop);});
  });

  // Hotkeys
  angular.element($document).bind("keyup", function(event) {
    if (event.which === 191) {
      $('#hotkeys').modal({
        backdropFade: true,
        dialogFade:true
      });
    }
  });
};
