var smartreader = smartreader || {};

smartreader.feed = function(id, name, updated, articles){
  this.id = id || "";
	this.name = name || "";
	this.updated = updated || new Date();
	this.articles = articles || [];
};

smartreader.article = function(title, author, date, des){
	this.title = title || "";
	this.author = author || "";
	this.date = date || {};
	this.description = des || "";
}
