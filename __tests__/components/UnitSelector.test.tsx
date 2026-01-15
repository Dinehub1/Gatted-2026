import { UnitSelector } from '@/components';
import { supabase } from '@/lib/supabase';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('@/lib/supabase');

describe('UnitSelector', () => {
    const mockOnSelect = jest.fn();
    const mockSocietyId = 'society-123';

    const mockBlocks = [
        { id: 'block-1', name: 'Block A', total_floors: 5 },
        { id: 'block-2', name: 'Block B', total_floors: 4 },
    ];

    const mockUnits = [
        { id: 'unit-1', unit_number: 'A-101', block_id: 'block-1', floor: 1 },
        { id: 'unit-2', unit_number: 'A-102', block_id: 'block-1', floor: 1 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Supabase queries
        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            if (table === 'blocks') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({ data: mockBlocks, error: null }),
                };
            }
            if (table === 'units') {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({ data: mockUnits, error: null }),
                };
            }
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            };
        });
    });

    it('should render block selector initially', async () => {
        const { getByText } = render(
            <UnitSelector societyId={mockSocietyId} onSelect={mockOnSelect} />
        );

        await waitFor(() => {
            expect(getByText('Select Block')).toBeTruthy();
        });
    });

    it('should load blocks on mount', async () => {
        const { getByText } = render(
            <UnitSelector societyId={mockSocietyId} onSelect={mockOnSelect} />
        );

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('blocks');
        });
    });

    it('should show error message when blocks fail to load', async () => {
        (supabase.from as jest.Mock).mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
        }));

        const { getByText } = render(
            <UnitSelector societyId={mockSocietyId} onSelect={mockOnSelect} />
        );

        await waitFor(() => {
            expect(getByText(/error/i)).toBeTruthy();
        });
    });

    it('should call onSelect when unit is selected', async () => {
        const { getByText } = render(
            <UnitSelector societyId={mockSocietyId} onSelect={mockOnSelect} />
        );

        // Wait for blocks to load and select one
        await waitFor(() => {
            const blockButton = getByText('Block A');
            fireEvent.press(blockButton);
        });

        // Select floor
        await waitFor(() => {
            const floorButton = getByText('Floor 1');
            fireEvent.press(floorButton);
        });

        // Select unit
        await waitFor(() => {
            const unitButton = getByText('A-101');
            fireEvent.press(unitButton);
        });

        expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'unit-1',
            unit_number: 'A-101',
        }));
    });
});
