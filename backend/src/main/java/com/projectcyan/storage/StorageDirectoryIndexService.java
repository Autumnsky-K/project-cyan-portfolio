package com.projectcyan.storage;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class StorageDirectoryIndexService {

	private static final String BOOTSTRAP_STATE_KEY = "storage-directory-index-bootstrap-v3";
	private static final Set<String> IMAGE_EXTENSIONS = Set.of(
		"avif", "gif", "jpeg", "jpg", "png", "svg", "webp"
	);

	private final JdbcTemplate jdbcTemplate;
	private final SupabaseStorageService supabaseStorageService;

	public StorageDirectoryIndexService(JdbcTemplate jdbcTemplate, SupabaseStorageService supabaseStorageService) {
		this.jdbcTemplate = jdbcTemplate;
		this.supabaseStorageService = supabaseStorageService;
	}

	public List<StorageDirectoryIndexRow> loadOrBootstrap() {
		ensureSchema();
		if (!isBootstrapComplete()) {
			rebuildFromStorage();
		}
		return listDirectories();
	}

	public List<StorageDirectoryIndexRow> listDirectories() {
		ensureSchema();
		return jdbcTemplate.query(
			"""
			select bucket_name, path, parent_path, depth, image_count, last_file_name, last_object_path,
				other_file_count, other_extension_summary, last_other_file_name, indexed_at
			from admin_storage_directory_index
			order by bucket_name, depth, path
			""",
			this::mapDirectory
		);
	}

	public List<SupabaseStorageBucket> bucketsFromIndex(List<StorageDirectoryIndexRow> directories) {
		return directories.stream()
			.filter(directory -> directory.path() == null || directory.path().isBlank())
			.map(directory -> new SupabaseStorageBucket(
				directory.bucketName(),
				directory.bucketName(),
				null,
				null,
				directory.indexedAt() == null ? null : directory.indexedAt().toString()
			))
			.toList();
	}

	public List<AdminStoragePageController.StoragePathOption> pathOptionsFromIndex(List<StorageDirectoryIndexRow> directories) {
		return directories.stream()
			.filter(directory -> directory.path() != null && !directory.path().isBlank())
			.map(directory -> new AdminStoragePageController.StoragePathOption(directory.bucketName(), directory.path()))
			.sorted(java.util.Comparator
				.comparing(AdminStoragePageController.StoragePathOption::bucketName)
				.thenComparing(AdminStoragePageController.StoragePathOption::path))
			.toList();
	}

	public void rebuildFromStorage() {
		ensureSchema();
		List<SupabaseStorageBucket> buckets = supabaseStorageService.listBuckets();
		Map<DirectoryKey, MutableDirectory> directories = new LinkedHashMap<>();
		for (SupabaseStorageBucket bucket : buckets) {
			if (bucket.name() == null || bucket.name().isBlank()) {
				continue;
			}
			if (!isObjectApiBucketName(bucket.name())) {
				continue;
			}
			ensureDirectory(directories, bucket.name(), "");
			Set<String> seenObjectPaths = new LinkedHashSet<>();
			try {
				indexFolderPaths(directories, bucket.name(), "");
				indexObjects(directories, bucket.name(), "", seenObjectPaths);
			} catch (SupabaseStorageException ignored) {
				// Keep the bucket visible and continue with any known fallback below.
			}
			if (AdminStoragePageController.GOODS_IMAGE_BUCKET.equals(bucket.name())) {
				try {
					indexFolderPaths(directories, bucket.name(), AdminStoragePageController.GOODS_IMAGE_PATH);
					indexObjects(directories, bucket.name(), AdminStoragePageController.GOODS_IMAGE_PATH, seenObjectPaths);
				} catch (SupabaseStorageException ignored) {
					// Keep the rest of the directory index usable if the known fallback path cannot be listed.
				}
			}
		}
		replaceDirectories(directories.values().stream().map(MutableDirectory::toRow).toList());
		markBootstrapComplete();
	}

	public void recordBucket(String bucketName) {
		ensureSchema();
		upsertDirectory(normalizeBucketName(bucketName), "");
	}

	public void recordPath(String bucketName, String path) {
		ensureSchema();
		String normalizedBucketName = normalizeBucketName(bucketName);
		for (String directoryPath : directoryPrefixes(path)) {
			upsertDirectory(normalizedBucketName, directoryPath);
		}
	}

	public void recordUploadedImage(SupabaseStorageObject object, boolean created) {
		if (object == null || object.bucketName() == null || object.bucketName().isBlank() || object.path() == null || object.path().isBlank()) {
			return;
		}
		ensureSchema();
		String bucketName = normalizeBucketName(object.bucketName());
		String objectPath = normalizeObjectPath(object.path());
		String fileName = object.name() == null || object.name().isBlank() ? objectFileName(objectPath) : object.name();
		for (String directoryPath : objectDirectoryPrefixes(objectPath)) {
			upsertDirectory(bucketName, directoryPath);
			jdbcTemplate.update(
				"""
				update admin_storage_directory_index
				set image_count = image_count + ?,
					last_file_name = ?,
					last_object_path = ?,
					indexed_at = now()
				where bucket_name = ? and path = ?
				""",
				created ? 1 : 0,
				fileName,
				objectPath,
				bucketName,
				directoryPath
			);
		}
	}

	private void indexObjects(
		Map<DirectoryKey, MutableDirectory> directories,
		String bucketName,
		String path,
		Set<String> seenObjectPaths
	) {
		for (SupabaseStorageObject object : supabaseStorageService.listObjects(bucketName, path, 1000)) {
			if (object.path() == null || !seenObjectPaths.add(object.path())) {
				continue;
			}
			addObject(directories, bucketName, object.path(), object.name());
		}
	}

	private void indexFolderPaths(Map<DirectoryKey, MutableDirectory> directories, String bucketName, String path) {
		for (String folderPath : supabaseStorageService.listFolderPaths(bucketName, path, 1000)) {
			if (folderPath != null && !folderPath.isBlank()) {
				ensureDirectory(directories, bucketName, folderPath);
			}
		}
	}

	private void addObject(Map<DirectoryKey, MutableDirectory> directories, String bucketName, String objectPath, String fileName) {
		String normalizedObjectPath = normalizeObjectPath(objectPath);
		String objectFileName = fileName == null || fileName.isBlank() ? objectFileName(normalizedObjectPath) : fileName;
		if (isIgnoredObjectFileName(objectFileName)) {
			return;
		}
		String extension = objectExtension(objectFileName);
		for (String directoryPath : objectDirectoryPrefixes(normalizedObjectPath)) {
			MutableDirectory directory = ensureDirectory(directories, bucketName, directoryPath);
			if (IMAGE_EXTENSIONS.contains(extension)) {
				directory.imageCount += 1;
				directory.lastFileName = objectFileName;
				directory.lastObjectPath = normalizedObjectPath;
			} else {
				directory.otherFileCount += 1;
				directory.lastOtherFileName = objectFileName;
				directory.otherExtensionCounts.merge(extensionLabel(extension), 1, Integer::sum);
			}
		}
	}

	private MutableDirectory ensureDirectory(Map<DirectoryKey, MutableDirectory> directories, String bucketName, String path) {
		String normalizedPath = normalizeOptionalPath(path);
		return directories.computeIfAbsent(
			new DirectoryKey(bucketName, normalizedPath),
			key -> new MutableDirectory(
				bucketName,
				normalizedPath,
				parentPath(normalizedPath),
				depth(normalizedPath)
			)
		);
	}

	private void replaceDirectories(List<StorageDirectoryIndexRow> rows) {
		jdbcTemplate.update("delete from admin_storage_directory_index");
		jdbcTemplate.batchUpdate(
			"""
			insert into admin_storage_directory_index
				(bucket_name, path, parent_path, depth, image_count, last_file_name, last_object_path,
				 other_file_count, other_extension_summary, last_other_file_name, indexed_at)
			values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())
			on conflict (bucket_name, path) do update set
				parent_path = excluded.parent_path,
				depth = excluded.depth,
				image_count = excluded.image_count,
				last_file_name = excluded.last_file_name,
				last_object_path = excluded.last_object_path,
				other_file_count = excluded.other_file_count,
				other_extension_summary = excluded.other_extension_summary,
				last_other_file_name = excluded.last_other_file_name,
				indexed_at = now()
			""",
			rows,
			200,
			(statement, row) -> {
				statement.setString(1, row.bucketName());
				statement.setString(2, row.path());
				statement.setString(3, row.parentPath());
				statement.setInt(4, row.depth());
				statement.setInt(5, row.imageCount());
				statement.setString(6, row.lastFileName());
				statement.setString(7, row.lastObjectPath());
				statement.setInt(8, row.otherFileCount());
				statement.setString(9, row.otherExtensionSummary());
				statement.setString(10, row.lastOtherFileName());
			}
		);
	}

	private boolean isBootstrapComplete() {
		Integer stateCount = jdbcTemplate.queryForObject(
			"select count(*) from admin_storage_directory_index_state where state_key = ?",
			Integer.class,
			BOOTSTRAP_STATE_KEY
		);
		return stateCount != null && stateCount > 0;
	}

	private void markBootstrapComplete() {
		jdbcTemplate.update(
			"""
			insert into admin_storage_directory_index_state (state_key, completed_at)
			values (?, now())
			on conflict (state_key) do update set completed_at = now()
			""",
			BOOTSTRAP_STATE_KEY
		);
	}

	private void upsertDirectory(String bucketName, String path) {
		String normalizedPath = normalizeOptionalPath(path);
		jdbcTemplate.update(
			"""
			insert into admin_storage_directory_index
				(bucket_name, path, parent_path, depth, image_count, indexed_at)
			values (?, ?, ?, ?, 0, now())
			on conflict (bucket_name, path) do update set
				parent_path = excluded.parent_path,
				depth = excluded.depth,
				indexed_at = now()
			""",
			bucketName,
			normalizedPath,
			parentPath(normalizedPath),
			depth(normalizedPath)
		);
	}

	private List<String> directoryPrefixes(String path) {
		List<String> prefixes = new ArrayList<>();
		prefixes.add("");
		String normalizedPath = normalizeOptionalPath(path);
		if (!StringUtils.hasText(normalizedPath)) {
			return prefixes;
		}
		String current = "";
		for (String segment : normalizedPath.split("/")) {
			current = current.isBlank() ? segment : current + "/" + segment;
			prefixes.add(current);
		}
		return prefixes;
	}

	private List<String> objectDirectoryPrefixes(String objectPath) {
		return directoryPrefixes(parentPath(normalizeObjectPath(objectPath)));
	}

	private String normalizeBucketName(String bucketName) {
		if (!StringUtils.hasText(bucketName)) {
			throw new SupabaseStorageException("Bucket 이름은 필수입니다.");
		}
		return bucketName.trim().toLowerCase();
	}

	private boolean isObjectApiBucketName(String bucketName) {
		return bucketName != null && bucketName.matches("[A-Za-z0-9][A-Za-z0-9._-]*");
	}

	private String normalizeObjectPath(String path) {
		if (!StringUtils.hasText(path)) {
			throw new SupabaseStorageException("object path는 필수입니다.");
		}
		return normalizeOptionalPath(path);
	}

	private String normalizeOptionalPath(String path) {
		if (!StringUtils.hasText(path)) {
			return "";
		}
		return path.trim().replace('\\', '/').replaceAll("^/+", "").replaceAll("/+$", "");
	}

	private String parentPath(String objectPath) {
		String normalizedPath = normalizeOptionalPath(objectPath);
		int separatorIndex = normalizedPath.lastIndexOf('/');
		return separatorIndex >= 0 ? normalizedPath.substring(0, separatorIndex) : "";
	}

	private String objectFileName(String objectPath) {
		int separatorIndex = objectPath.lastIndexOf('/');
		return separatorIndex >= 0 ? objectPath.substring(separatorIndex + 1) : objectPath;
	}

	private boolean isIgnoredObjectFileName(String fileName) {
		return ".emptyFolderPlaceholder".equals(fileName) || ".keep".equals(fileName);
	}

	private String objectExtension(String fileName) {
		int separatorIndex = fileName.lastIndexOf('.');
		if (separatorIndex < 0 || separatorIndex == fileName.length() - 1) {
			return "";
		}
		return fileName.substring(separatorIndex + 1).toLowerCase(java.util.Locale.ROOT);
	}

	private String extensionLabel(String extension) {
		return StringUtils.hasText(extension) ? "." + extension : "확장자 없음";
	}

	private int depth(String path) {
		if (!StringUtils.hasText(path)) {
			return 0;
		}
		return path.split("/").length;
	}

	private StorageDirectoryIndexRow mapDirectory(ResultSet resultSet, int rowNumber) throws SQLException {
		Timestamp indexedAt = resultSet.getTimestamp("indexed_at");
		return new StorageDirectoryIndexRow(
			resultSet.getString("bucket_name"),
			resultSet.getString("path"),
			resultSet.getString("parent_path"),
			resultSet.getInt("depth"),
			resultSet.getInt("image_count"),
			resultSet.getString("last_file_name"),
			resultSet.getString("last_object_path"),
			resultSet.getInt("other_file_count"),
			resultSet.getString("other_extension_summary"),
			resultSet.getString("last_other_file_name"),
			indexedAt == null ? null : indexedAt.toInstant()
		);
	}

	private void ensureSchema() {
		jdbcTemplate.execute(
			"""
			create table if not exists admin_storage_directory_index (
				bucket_name varchar(255) not null,
				path text not null default '',
				parent_path text,
				depth integer not null default 0,
				image_count integer not null default 0,
				last_file_name text,
				last_object_path text,
				other_file_count integer not null default 0,
				other_extension_summary text,
				last_other_file_name text,
				indexed_at timestamptz not null default now(),
				primary key (bucket_name, path)
			)
			"""
		);
		jdbcTemplate.execute("alter table admin_storage_directory_index add column if not exists other_file_count integer not null default 0");
		jdbcTemplate.execute("alter table admin_storage_directory_index add column if not exists other_extension_summary text");
		jdbcTemplate.execute("alter table admin_storage_directory_index add column if not exists last_other_file_name text");
		jdbcTemplate.execute(
			"""
			create index if not exists admin_storage_directory_index_parent_idx
			on admin_storage_directory_index (bucket_name, parent_path)
			"""
		);
		jdbcTemplate.execute(
			"""
			create table if not exists admin_storage_directory_index_state (
				state_key varchar(120) primary key,
				completed_at timestamptz not null default now()
			)
			"""
		);
	}

	private record DirectoryKey(String bucketName, String path) {
	}

	private static final class MutableDirectory {
		private final String bucketName;
		private final String path;
		private final String parentPath;
		private final int depth;
		private int imageCount;
		private String lastFileName;
		private String lastObjectPath;
		private int otherFileCount;
		private String lastOtherFileName;
		private final Map<String, Integer> otherExtensionCounts = new LinkedHashMap<>();

		private MutableDirectory(String bucketName, String path, String parentPath, int depth) {
			this.bucketName = bucketName;
			this.path = path;
			this.parentPath = parentPath;
			this.depth = depth;
		}

		private StorageDirectoryIndexRow toRow() {
			return new StorageDirectoryIndexRow(
				bucketName,
				path,
				parentPath,
				depth,
				imageCount,
				lastFileName,
				lastObjectPath,
				otherFileCount,
				extensionSummary(),
				lastOtherFileName,
				Instant.now()
			);
		}

		private String extensionSummary() {
			if (otherExtensionCounts.isEmpty()) {
				return null;
			}
			return otherExtensionCounts.entrySet().stream()
				.sorted(Map.Entry.<String, Integer>comparingByKey())
				.map(entry -> entry.getKey() + "(" + entry.getValue() + "개)")
				.reduce((left, right) -> left + "/" + right)
				.orElse(null);
		}
	}
}
