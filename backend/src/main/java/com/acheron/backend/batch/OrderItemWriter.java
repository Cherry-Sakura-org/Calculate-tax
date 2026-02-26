package com.acheron.backend.batch;

import com.acheron.backend.entity.Order;
import com.acheron.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderItemWriter implements ItemWriter<Order> {

    private final OrderRepository orderRepository;

    @Override
    public void write(Chunk<? extends Order> chunk) {
        orderRepository.saveAll(chunk.getItems());
        log.info("Saved batch of {} orders to database", chunk.getItems().size());
    }
}
