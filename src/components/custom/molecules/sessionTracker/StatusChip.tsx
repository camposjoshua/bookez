import { Chip } from "@mui/material";

const statusMap: Record<
number,
{
  label: string;
  color:
    | 'default'
    | 'info'
    | 'success'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning';
}
> = {
0: { label: 'Pending', color: 'default' },
1: { label: 'Confirmed', color: 'info' },
2: { label: 'Cancelled', color: 'warning' },
3: { label: 'Completed', color: 'success' },
4: { label: 'No Show', color: 'error' },
};

export const StatusChip = (status: any) => {
	const { label, color } = statusMap[status] || {
		label: 'No Record',
		color: 'default',
	};

	return <Chip label={label} color={color} size="small" sx={{ fontSize: 9 }} />;
  };