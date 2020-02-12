export default abstract class AbstractBrowserStorageUtil {
	public static getInstance: () => AbstractBrowserStorageUtil;

	public abstract set(toSet: object): void;

	public abstract get(key: string): Promise<any>;
}
