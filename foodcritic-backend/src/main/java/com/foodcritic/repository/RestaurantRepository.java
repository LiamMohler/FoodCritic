package com.foodcritic.repository;

import com.foodcritic.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {
    
    List<Restaurant> findByCuisineContainingIgnoreCase(String cuisine);
    
    List<Restaurant> findByNameContainingIgnoreCase(String name);
    
    Optional<Restaurant> findByNameAndLocation(String name, String location);
    
    List<Restaurant> findByLatitudeBetweenAndLongitudeBetween(
        Double minLatitude, Double maxLatitude, 
        Double minLongitude, Double maxLongitude);
    
    @Query("SELECT r FROM Restaurant r ORDER BY " +
           "(SELECT AVG(rev.rating) FROM Review rev WHERE rev.restaurant = r) DESC NULLS LAST")
    List<Restaurant> findAllOrderByAverageRatingDesc();
    
    // San Diego specific searches - constrain to San Diego county bounds
    @Query("SELECT r FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707 " +
           "ORDER BY r.name ASC")
    List<Restaurant> findAllInSanDiego();
    
    // Simple paginated San Diego restaurants (no filters to avoid type conflicts)
    @Query("SELECT r FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707 " +
           "ORDER BY r.name ASC")
    org.springframework.data.domain.Page<Restaurant> findAllInSanDiegoPaginated(
        org.springframework.data.domain.Pageable pageable
    );
    
    // Advanced search with multiple filters for San Diego area
    @Query("SELECT r FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707 AND " +
           "(:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:cuisine IS NULL OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :cuisine, '%'))) AND " +
           "(:location IS NULL OR LOWER(r.address) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:priceLevel IS NULL OR r.priceLevel = :priceLevel) AND " +
           "(:openNow IS NULL OR r.openNow = :openNow) AND " +
           "(:minRating IS NULL OR (SELECT AVG(rev.rating) FROM Review rev WHERE rev.restaurant = r) >= :minRating)")
    List<Restaurant> findInSanDiegoWithFilters(
        @Param("name") String name,
        @Param("cuisine") String cuisine,
        @Param("location") String location,
        @Param("priceLevel") Integer priceLevel,
        @Param("openNow") Boolean openNow,
        @Param("minRating") Double minRating
    );
    
    // Search by neighborhood/area within San Diego
    @Query("SELECT r FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707 AND " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :neighborhood, '%'))")
    List<Restaurant> findByNeighborhoodInSanDiego(@Param("neighborhood") String neighborhood);
    
    // Get all distinct cuisines in San Diego
    @Query("SELECT DISTINCT r.cuisine FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707 AND " +
           "r.cuisine IS NOT NULL " +
           "ORDER BY r.cuisine")
    List<String> findDistinctCuisinesInSanDiego();
    
    // Get all distinct neighborhoods/areas in San Diego
    @Query("SELECT DISTINCT CASE " +
           "WHEN LOWER(r.address) LIKE '%downtown%' THEN 'Downtown San Diego' " +
           "WHEN LOWER(r.address) LIKE '%la jolla%' THEN 'La Jolla' " +
           "WHEN LOWER(r.address) LIKE '%gaslamp%' THEN 'Gaslamp Quarter' " +
           "WHEN LOWER(r.address) LIKE '%mission beach%' THEN 'Mission Beach' " +
           "WHEN LOWER(r.address) LIKE '%pacific beach%' THEN 'Pacific Beach' " +
           "WHEN LOWER(r.address) LIKE '%hillcrest%' THEN 'Hillcrest' " +
           "WHEN LOWER(r.address) LIKE '%north park%' THEN 'North Park' " +
           "WHEN LOWER(r.address) LIKE '%south park%' THEN 'South Park' " +
           "WHEN LOWER(r.address) LIKE '%mission valley%' THEN 'Mission Valley' " +
           "WHEN LOWER(r.address) LIKE '%little italy%' THEN 'Little Italy' " +
           "WHEN LOWER(r.address) LIKE '%coronado%' THEN 'Coronado' " +
           "WHEN LOWER(r.address) LIKE '%del mar%' THEN 'Del Mar' " +
           "WHEN LOWER(r.address) LIKE '%encinitas%' THEN 'Encinitas' " +
           "WHEN LOWER(r.address) LIKE '%carlsbad%' THEN 'Carlsbad' " +
           "ELSE 'Other San Diego Areas' " +
           "END as neighborhood " +
           "FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707")
    List<String> findDistinctNeighborhoodsInSanDiego();
    
    // Location-based search with distance calculation
    @Query("SELECT r FROM Restaurant r WHERE " +
           "r.latitude BETWEEN 32.534156 AND 33.114249 AND " +
           "r.longitude BETWEEN -117.608643 AND -116.908707 AND " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(r.latitude)) * " +
           "cos(radians(r.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
           "sin(radians(r.latitude)))) <= :radiusKm " +
           "ORDER BY " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(r.latitude)) * " +
           "cos(radians(r.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
           "sin(radians(r.latitude))))")
    List<Restaurant> findNearbyInSanDiego(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radiusKm") Double radiusKm
    );
}