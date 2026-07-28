import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
// H.264, high quality for social upload
Config.setCodec("h264");
Config.setCrf(18);
