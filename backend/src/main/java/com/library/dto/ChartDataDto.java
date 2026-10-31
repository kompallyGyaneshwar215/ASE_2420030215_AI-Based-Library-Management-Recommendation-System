package com.library.dto;

public class ChartDataDto {
    private String name;
    private Number value;
    private String secondary;

    public ChartDataDto() {}

    public ChartDataDto(String name, Number value) {
        this.name = name;
        this.value = value;
    }

    public ChartDataDto(String name, Number value, String secondary) {
        this.name = name;
        this.value = value;
        this.secondary = secondary;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Number getValue() { return value; }
    public void setValue(Number value) { this.value = value; }

    public String getSecondary() { return secondary; }
    public void setSecondary(String secondary) { this.secondary = secondary; }
}
