import { useMemo, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Button,
  Chip,
  Toolbar,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EmptyState from './EmptyState';

function exportCsv(rows, columns, filename) {
  const header = columns.map((c) => c.label).join(',');
  const body = rows
    .map((r) => columns.map((c) => `"${String(r[c.field] ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EnterpriseTable({
  columns,
  rows,
  searchKeys,
  title,
  filters, // optional React node (chips/selects) rendered in toolbar
  exportFilename = 'export.csv',
  defaultSort,
  emptyTitle = 'No records match your filters',
}) {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultSort || columns[0]?.field);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    const keys = searchKeys || columns.map((c) => c.field);
    return rows.filter((r) => keys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
  }, [rows, query, columns, searchKeys]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[orderBy];
      const bv = b[orderBy];
      if (typeof av === 'number' && typeof bv === 'number') return order === 'asc' ? av - bv : bv - av;
      return order === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, order, orderBy]);

  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (field) => {
    if (orderBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  return (
    <Box>
      <Toolbar disableGutters sx={{ flexWrap: 'wrap', gap: 1.5, mb: 1, minHeight: 'auto !important', px: 0 }}>
        <TextField
          size="small"
          placeholder={`Search ${title || 'records'}...`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ flex: 1 }} />
        {filters}
        <Chip size="small" variant="outlined" label={`${sorted.length} records`} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={() => exportCsv(sorted, columns, exportFilename)}
        >
          Export
        </Button>
      </Toolbar>

      {sorted.length === 0 ? (
        <EmptyState title={emptyTitle} description="Try a different search term or clear active filters." />
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 520, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.field} sx={{ minWidth: col.minWidth }}>
                      {col.sortable === false ? (
                        col.label
                      ) : (
                        <TableSortLabel
                          active={orderBy === col.field}
                          direction={orderBy === col.field ? order : 'asc'}
                          onClick={() => handleSort(col.field)}
                        >
                          {col.label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((row, i) => (
                  <TableRow key={row.id || i} hover>
                    {columns.map((col) => (
                      <TableCell key={col.field}>
                        {col.render ? col.render(row) : row[col.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={sorted.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
    </Box>
  );
}
