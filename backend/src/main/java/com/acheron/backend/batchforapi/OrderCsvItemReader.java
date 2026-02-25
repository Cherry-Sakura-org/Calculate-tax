package com.acheron.backend.batchforapi;

import com.acheron.backend.batchforapi.dto.OrderCsvRecord;
import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;

import org.springframework.batch.infrastructure.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.infrastructure.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.infrastructure.item.file.transform.DelimitedLineTokenizer;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class OrderCsvItemReader {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = 
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss[.SSSSSSSSS][.SSSSSS][.SSS]");

    public FlatFileItemReader<OrderCsvRecord> createReader(Resource resource) {
        BeanWrapperFieldSetMapper<OrderCsvRecord> fieldSetMapper = new BeanWrapperFieldSetMapper<>();
        fieldSetMapper.setTargetType(OrderCsvRecord.class);
        fieldSetMapper.setCustomEditors(java.util.Map.of(
                LocalDateTime.class, new java.beans.PropertyEditorSupport() {
                    @Override
                    public void setAsText(String text) {
                        try {
                            setValue(LocalDateTime.parse(text, TIMESTAMP_FORMATTER));
                        } catch (Exception e) {
                            throw new IllegalArgumentException("Invalid timestamp format: " + text, e);
                        }
                    }
                }
        ));

        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setNames("id", "longitude", "latitude", "timestamp", "subtotal");
        tokenizer.setDelimiter(",");

        return new FlatFileItemReaderBuilder<OrderCsvRecord>()
                .name("orderCsvItemReader")
                .resource(resource)
                .linesToSkip(1)
                .lineTokenizer(tokenizer)
                .fieldSetMapper(fieldSetMapper)
                .strict(true)
                .build();
    }
}
