package com.foodcritic.repository;

import com.foodcritic.model.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.restaurant WHERE r.restaurant.id = :restaurantId ORDER BY r.createdAt DESC")
    List<Review> findByRestaurant_IdOrderByCreatedAtDesc(@Param("restaurantId") String restaurantId);
    
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.restaurant WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Review> findByUser_IdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.restaurant WHERE r.user.id = :userId AND r.restaurant.id = :restaurantId")
    Optional<Review> findByUser_IdAndRestaurant_Id(@Param("userId") Long userId, @Param("restaurantId") String restaurantId);
    
    boolean existsByUser_IdAndRestaurant_Id(Long userId, String restaurantId);
    
    @Query("SELECT r FROM Review r JOIN FETCH r.user JOIN FETCH r.restaurant ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews(Pageable pageable);
    
    default List<Review> findRecentReviews(int limit) {
        return findRecentReviews(org.springframework.data.domain.PageRequest.of(0, limit));
    }
}