package com.library.repository;

import com.library.entity.LibrarySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibrarySettingRepository extends JpaRepository<LibrarySetting, Long> {
}
