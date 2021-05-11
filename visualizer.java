import java.math.BigInteger;

public class visualizer {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int size = Integer.parseInt("3");
		String board = new BigInteger("35502686737").toString(2);
		String status = new BigInteger("144115188075855872").toString(2);
		while(board.length()<size*size) {
			board = "0"+board;
		}
		while(status.length() < 256) {
			status = "0" + status;
		}
		String result = "";
		for(int i = 0; i < size; i++ ) {
			for(int j = 0; j < size; j++) {
				int index = 4*size*size -4 - 4*(size*i + j);
				String piece = board.substring(index, index+4);
				char c = '?';
				switch (piece) {
				case "0000":
					c = '0';
					break;
				case "0001":
					c = '1';
					break;
				case "0010":
					c = '2';
					break;
				case "0100":
					c = '3';
					break;
				case "1000":
					c = '4';
					break;
				}
				result = result + c;
			}
			result = result + '\n';
		}
		System.out.println(result);
		System.out.print("(Position) isBlocked | ");
		for(int i = 0; i < 4; i++) {
			System.out.printf("%d: (%d,%d) %s, ", i+1,Integer.parseInt(status.substring(250-i*6, 253-i*6),2),
					Integer.parseInt(status.substring(253-i*6, 256-i*6),2), status.substring(221-i,222-i));
		}
		System.out.println();
		System.out.printf("# of players: %d, board size: %d, winner: %d, active: %d, turn: %d\n",
				Integer.parseInt(status.substring(227,230),2),
				Integer.parseInt(status.substring(223,227),2),
				Integer.parseInt(status.substring(217,219),2)+1,
				Integer.parseInt(status.substring(216,217),2),
				Integer.parseInt(status.substring(192,201),2)+1);
		
	}

}
