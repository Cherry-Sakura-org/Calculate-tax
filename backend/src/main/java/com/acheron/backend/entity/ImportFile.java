package com.acheron.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = true)
@ToString(onlyExplicitlyIncluded = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "import_files")
@Entity
public class ImportFile extends AbstractAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "original_filename", nullable = false, length = 500)
    private String originalFilename;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "total_records", nullable = false)
    private Integer totalRecords;

    @Column(name = "successful_records", nullable = false)
    private Integer successfulRecords;

    @Column(name = "failed_records", nullable = false)
    private Integer failedRecords;

    @Column(name = "out_of_ny_records", nullable = false)
    @Builder.Default
    private Integer outOfNyRecords = 0;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "records_per_second")
    private Double recordsPerSecond;

    @Column(name = "imported_at", nullable = false)
    private LocalDateTime importedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "imported_by_user_id", nullable = false)
    private User importedByUser;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "COMPLETED";
}
