package com.library.service;

import com.library.dto.CategoryDto;
import com.library.entity.Category;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(cat -> {
            long count = bookRepository.findByCategoryId(cat.getId()).size();
            return new CategoryDto(cat.getId(), cat.getCategoryName(), cat.getDescription(), count);
        }).collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByCategoryName(dto.getCategoryName())) {
            throw new BadRequestException("Category already exists: " + dto.getCategoryName());
        }
        Category cat = new Category(dto.getCategoryName(), dto.getDescription());
        Category saved = categoryRepository.save(cat);
        return new CategoryDto(saved.getId(), saved.getCategoryName(), saved.getDescription(), 0);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
