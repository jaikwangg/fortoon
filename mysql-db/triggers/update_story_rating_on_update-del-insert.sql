-- First, add averageRating column to Story table if it doesn't exist

-- Create trigger for INSERT
DELIMITER //
CREATE TRIGGER after_review_insert
AFTER INSERT ON ReviewStory
FOR EACH ROW
BEGIN
    UPDATE Story s
    SET averageRating = (
        SELECT ROUND(AVG(rating), 2)
        FROM ReviewStory
        WHERE storyId = NEW.storyId
    )
    WHERE s.sId = NEW.storyId;
END;//

-- Create trigger for UPDATE
CREATE TRIGGER after_review_update
AFTER UPDATE ON ReviewStory
FOR EACH ROW
BEGIN
    UPDATE Story s
    SET averageRating = (
        SELECT ROUND(AVG(rating), 2)
        FROM ReviewStory
        WHERE storyId = NEW.storyId
    )
    WHERE s.sId = NEW.storyId;
END;//

-- Create trigger for DELETE
CREATE TRIGGER after_review_delete
AFTER DELETE ON ReviewStory
FOR EACH ROW
BEGIN
    UPDATE Story s
    SET averageRating = COALESCE(
        (SELECT ROUND(AVG(rating), 2)
        FROM ReviewStory
        WHERE storyId = OLD.storyId),
        0.00
    )
    WHERE s.sId = OLD.storyId;
END;//

DELIMITER ;