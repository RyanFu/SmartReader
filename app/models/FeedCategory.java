package models;

import java.lang.reflect.Type;

import java.util.ArrayList;
import java.util.List;

import com.google.code.morphia.annotations.Entity;
import com.google.code.morphia.annotations.Id;
import com.google.code.morphia.annotations.Reference;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;

import org.bson.types.ObjectId;

import util.MorphiaObject;

@Entity
public class FeedCategory extends MongoModel {

    @Id
    public ObjectId id;
    
    public String name;
    
    @Reference(lazy=true)
    public User user;
    
    @Reference(concreteClass = ArrayList.class, lazy=true)
    public List<UserFeed> userFeeds = new ArrayList<UserFeed>();
    
    @Reference(concreteClass = ArrayList.class, lazy=true)
    public List<Article> articles = new ArrayList<Article>();
    
    public static FeedCategory find(String categoryId) {
        return MorphiaObject.datastore.get(FeedCategory.class, categoryId);
    }
    
    public List<Article> crawl() throws Exception{
        for(UserFeed userFeed: this.userFeeds){
            this.articles.addAll(userFeed.feed.crawl());
        }
        return this.articles;
    }
    
    public static class Serializer implements JsonSerializer<FeedCategory> {

        @Override
        public JsonElement serialize(FeedCategory src, Type type,
                JsonSerializationContext ctx) {
            JsonObject feedObject = new JsonObject();
            feedObject.add("id", new JsonPrimitive(src.id.toString()));
            feedObject.add("name", new JsonPrimitive(src.name));
            feedObject.add("userFeeds", ctx.serialize(src.userFeeds));
            return feedObject;
        }
    }
    
}
